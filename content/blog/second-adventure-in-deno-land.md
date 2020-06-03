---
title: Second adventure in deno land
description: Going a little deeper on deno. Lock files, testing, sharing code between deno and the browser.
date: "2020-06-15"
published: true
featuredImage: ./adventures-in-deno-land/banner.png
---

On my last post, I wrote about [my first adventure in deno.land](https://alexandrempsantos.com/adventures-in-deno-land/). I have to say it was a fun one. That excitement of trying some new technology was always there. It ended with me think about new possibilities and tools and asking what am I going to build with it.

I built a small twitter bot, without any libraries, to scratch the surface of the standard library, and to get to know _deno_ a little better in a context that is not an overly simplistic "hello world".

It was very well-received. To be honest it was well more than what I was expected. It ended up being, to the time, my most read and reacted post ever. It redirected in a day, as many people as my website normally has in a month. I got quite lucky on the "deno hype train".

Back to the main subject, on that post I explored the standard library, module imports, simple permission system and dependency management. Today I'm talking about the following topics:

- Lock files
- Official VSCode extension
- Documentation
- More granular permissions
- Running deno code in the browser
- Tests

Again, if you want to follow the code, [here you have it]().

## Lock files

To complete the information from the last post about dependencies, I'll talk about lock files. They're a standard practice in node in pretty much every production app and they're used to describe an exact tree of dependencies. This is used to make installations more repeatable, avoiding issues that may arrise out of version misalignement.

In _deno_ you can generate a lock file for the used dependencies by running

```bash
deno cache --lock=lock.json --lock-write ./src/deps
```

This command will _cache_ (that local installs the used dependencies) based on a `lock.json` file. The `--lock-write` flag updates or creates the `lock.json` file. The last parameter is the file that uses the dependencies.

To install the dependencies while integrity checking every installed resource, one can run:

```bash
$ deno cache -r --lock=lock.json deps.ts
```

The generated file is no more that a json object of dependencies and a checksum.

## VSCode extension

The official vscode extension is launched! However, it is the exact same that I talked about last time. It was just moved to the official repo, as the changelog states

> Moved from https://github.com/justjavac/vscode-deno to https://github.com/denoland/vscode_deno in order to have an "official" Deno plugin.

It works very well, autocompeltes and files imports are fine, as expected. There's a small problem though, when you cmd + click on external dependencies, it does not detect the language, so the file appears without any highlighting.

I'm sure it will be fixed soon but it's also an **oportunity for contribution** that I might take, after I get the time to understand the code from vscode and the plugin itself.

## Documentation

Another of the advantages presented by Ryan in his talk has that deno included a documentation generator on the official bynary. The documentation generator doesn't have (yet) a section on the website, but we'll explore it a bit here.

### Documentation of remote modules

Deno caching local modules allows stuff like coding in an airplane (that was also possible in node if you have ran `npm install` before). However, deno provides a cool way to see the third party code documentation without having to browse the code.

```bash
$ deno doc https://deno.land/std/http/server.ts
```

This outputs the methods exposed by the standard library's http server.

```ts
function listenAndServe(addr: string | HTTPOptions, handler: (req: ServerRequest) => void): Promise<void>
  Start an HTTP server with given options and request handler

function listenAndServeTLS(options: HTTPSOptions, handler: (req: ServerRequest) => void): Promise<void>
  Start an HTTPS server with given options and request handler

function serve(addr: string | HTTPOptions): Server
  Create a HTTP server

function serveTLS(options: HTTPSOptions): Server
  Create an HTTPS server with given options

class Server implements AsyncIterable

class ServerRequest

interface Response
  Interface of HTTP server response. If body is a Reader, response would be chunked. If body is a string, it would be UTF-8 encoded by default.

type HTTPOptions
  Options for creating an HTTP server.

type HTTPSOptions
  Options for creating an HTTPS server.
```

Very neat, right? A very nice way of having an overview of the modules.

To see the documentation for a specific symbol, one can also run.

```bash
$ deno doc https://deno.land/std/http/server.ts listenAndServe
```

Which outputs

```ts
function listenAndServe(addr: string | HTTPOptions, handler: (req: ServerRequest) => void): Promise<void>
    Start an HTTP server with given options and request handler
        const body = "Hello World\n";     const options = { port: 8000 };     listenAndServe(options, (req) => {       req.respond({ body });     });
    @param options Server configuration @param handler Request handler

```

The `--json` flag is also supported (however, not for symbols), and allows generating the documentation in the json format, enabling programmatic uses.

One great example of the documentation generation uses is _deno_ [runtime API](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts).

It uses Deno to generate modules with the `--json` command and provides a really nice layout around it.

I've actually started trying to adapt the code from the official docs and the logic it uses to generate documentation on the fly so people can run it locally for their own projects. [Here it is]() TODO - not finished

## Fine grained permissions

This is, again, one thing that _deno_ got very well. They're easy to use and secure by default. On the last post I explained that in order for a script to be able to access the network, for instance, you'd have to explicitly use `--allow-net` flag when running it.

That is true, however, I was alerted by my friend [Felipe Schmitt] that in order for it to be stricter, we can use:

```
deno run --allow-net=api.twitter.com index.ts
```

This would, as you probably guess, allow network calls to `api.twitter.com` but disallow all the other calls. Instead of allowing complete access to network, we're allowing just part of it, whitelisting and blocking everything else by default.

This is now very well explained on the [Permissions page](https://deno.land/manual/getting_started/permissions.), which is one of the documentation improvements that were added after the v.1.0.0 launch.

## Running code in the browser

Another very interesting feature of _deno_, is the `bundle` command.

It allows you to bundle your code into a single `.js` file. That file can be run as any other deno program, with `deno run`.

What I find interesting is that the generated code, when it doesn't use the `Deno` namespace, is that it **can run on the browser**.

The possibilities for this are limitless. For instance, what if I wanted a frontend to interact with my API via a js client?

I can write that client in deno, reusing API code. Here's the code to get the popular tweets.

```ts
// client/index.ts
import { Tweet } from "../twitter/client.ts"

export function popular(handle: string): Promise<Tweet[]> {
  return fetch(`http://localhost:8080/popular/${handle}`)
    .then(res => res.json())
    .catch(console.error)
}
```

This code lives on the API codebase, and thus it is written in _deno_ (you can tell by the imports having file extensions). It uses the same types from the twitter client.

Having the client living on the API codebase means that whoever updates the API should also update the client, abstracting the backend and API changes from the frontend code. This is not a _deno_ feature but something that it enables.

Then, we can run the `bundle` command and put the generated file in a folder.

```bash
$ deno bundle client/index.ts public/client.js
```

It will generate the `client.js` file that is able to be run in the browser. For demonstration purposes we can create a `public/index.html` file with the following code:

```html
<script type="module">
  import * as client from "./client.js"

  async function fetchTwitter(event) {
    const result = await client.popular(value)

    /*
      Omitted for brevity
    */
  }
</script>
```

Which uses the client that was initially written in deno, and is now a js file.

And the `public` folder can be served by any webserver. Since we're talking about deno, we can serve it with standard library's file server.

```bash
# inside the public folder
$ deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

With this, our code can use the client that was **originally written in deno** on the frontend, to interact with the API.

## Testing

To be done
