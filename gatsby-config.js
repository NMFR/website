module.exports = {
  siteMetadata: {
    title: `learning as we go`,
    author: `Alexandre Portela dos Santos`,
    description: `(trying to) help businesses with tech | Full-time learner | Writer`,
    siteDescription: `A blog about the learning journey of a software developer interested in solving business problems with the help of technology.`,
    location: {
      city: "Lisbon",
      country: "Portugal",
    },
    siteUrl: "https://alexandrempsantos.com",
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/ampsantos0`,
      },
      {
        name: `github`,
        url: `https://github.com/asantos00`,
      },
      {
        name: `linkedin`,
        url: `https://www.linkedin.com/in/alexandrempsantos/`,
      },
    ],
  },
  plugins: [
    `gatsby-plugin-robots-txt`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        sitemapSize: 5000
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          "gatsby-remark-reading-time",
          {
            resolve: "@weknow/gatsby-remark-twitter",
            options: {
              align: "center",
            },
          },
          {
            resolve: "gatsby-remark-embed-gist",
            options: {
              username: "asantos00",
              includeDefaultCss: true,
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1100,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              offsetY: 54
            }
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-81851050-1`,
      },
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `learning as we go`,
        short_name: `lawg`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/favicon.png`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
