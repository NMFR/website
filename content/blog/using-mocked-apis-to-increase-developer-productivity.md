---
title: "Using mocked APIs to increase developer productivity"
description: "How not to depend on backend APIs to keep developing front-end applications"
date: "2019-05-22"
---

When we’re developing a frontend, we just might be lucky enough to have a full-fledged API, although in the real world, for the most time,  we’ll get ourselves into a position where we have to develop without an API is available with all the functionality we require in the future.

There are a few tools that enable us to minimize this dependency, I remember `ember` has the great `ember-cli-mirage`. It provides the functionality you need, deeply integrated with `ember` and makes you develop **by default** with a completely mocked API, which I think is a great principle to start with.
It is also great to be able to run the application without depending on external servers (imagine on a plane, on a trip without internet, or just on a computer with low memory).
You do not want your UI developers to run 3 servers just to develop a button.

## Usecase

The last days we were faced with a similar issue. We're developing a screen, we had the API signature, but the API was not ready yet.

One alternative would be to just have the payload somewhere hardcoded, while we were waiting for the finished API.
Sure, we can develop your button with that but then it is not possible to implement the part of the application that does the requests. We also wanted, in future, to spend as little effort as possible to change from the mocked data to a real API.

That solution did not look right, especially when we still remember `ember-cli-mirage`. Unfortunately, we can't use `ember-cli-mirage` with other libraries, even though we really miss the functionality it provides.

The solution we ended up with was a combination of `json-server` with `route-parser` and using `axios` request interceptors.

In our http-client we had calls to `axios`, so, the first thing we did was to add this line.

```javascript
// httpClient.js
import mockApiRequestInterceptor from './mockApiRequestInterceptor';

axios.interceptors.request.use(mockApiRequestInterceptor);
// Please keep in mind that if you use axios instance,
// you have to do it on the instance
```

And we've created the request interceptor

```javascript
// mockApiRequestInterceptor.js
import UrlPattern from 'route-parser';
import { API_BASE_URL } from 'appConfig';

const MOCK_API_BASE_URL = 'http://localhost:3001/api';
const MOCK_URLS = [
  `${API_BASE_URL}/:user/posts/:id`
];

export default (config) => {
    if (!IS_DEVELOPMENT) {
        return config;
    }

    const matchedUrl = MOCK_URLS.find(mockUrl => {
        const pattern = new UrlPattern(mockUrl);
        return pattern.match(config.url);
    });

    if (matchedUrl) {
        config.url = config.url.replace(API_BASE_URL, MOCK_API_BASE_URL);
    }

    return config;
};
```

The mocked URLs would be added to `MOCK_URLS`, and if there is a *mocked version of them* they will be redirected.

So, this code would redirect requests made from a URL that is `https://mycrazyserver.com/api/asantos00/posts/123` to `http://localhost:3001/api/asantos00/posts/123`, and part of the problem was solved.

After this, we took advantage of another great package `json-server` (TLDR: *Serves JSON files through REST routes*).

We've created an npm script that runs this `json-server` with a few configurations (I will explain them later).

```json
// package.json
{
    "scripts": {
        "mock-api:serve": "json-server --watch mock-api/db.json --port 3001 --routes mock-api/routes.json"
    }
}
```

And created a `db.json` file

```json
// mock-api/db.json
{
    "posts": [
        {
            "id": 1,
            "title": "Mocking an API with axios",
            "author": "asantos00",
            "createdAt": 1557937282,
            "body": "Lorem ipsum dolor sit amet, consectetur."
        },
        {
            "id": 2,
            "title": "Whatever post",
            "author": "asantos00",
            "createdAt": 758851200,
            "body": "Lorem ipsum dolor sit amet, consectetur."
        }
    ]
}

```

It automatically creates rest endpoints for every entity on the `db.json` file and watches the db file for changes.

As we said before, `json-server` creates REST endpoints for entities, this means that after we have the entity `post` on the `db.json`, the following endpoints are created:

- `GET /posts` - Returns the list of posts
- `GET /posts/:id` - Returns post with the sent id
- `POST /posts` - Creates a post
- `PUT /posts/:id` - Replaces the post with the sent id


The file to create custom routes is `routes.json`.

```json
// mock-api/routes.json
{
  "/api/*": "/$1",
  "/:user/posts/:id": "/posts?user=:user"
}
```

The routes file only says that whatever request comes to `/:user/posts/:id`, we redirect to the *automatically created* endpoint that is `/posts`. And yeah,`json-server` also supports filtering, we use the query param `user` to do it here.

**It's done!** Now, our app will continue making the requests to the endpoints that are implemented. But we can keep developing this page with the mocked API.
As soon as we want to use the real API, it is just a matter of removing the url from `MOCK_URLS` (which can also be extracted to a separate file) in `mockApiRequestInterceptor` file.

## Conclusion

In the end, this solution really improves the process, helping us not being concerned about backend endpoints being done or not, while implementing all the cases in a *closer to real* environment.
Another nice thing about this is that it is also **library agnostic** as it only depends on the *http-client* so you can use it from `react` to `backbone.js` or even to `react-native`.

None of this would be possible without the **amazing open source packages** I've used, it was just a matter of getting the pieces together for the explained use case.

What solutions do you use to solve this problem? Is it something you stumble upon frequently?
