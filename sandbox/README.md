# Alloyio.com Sandbox

## Getting started

**Pre-requisites**

* Nodejs
* Npm

## Sandbox structure

The content of the sandbox is written in [Markdown](https://daringfireball.net/projects/markdown/).

### Markdown pages

Make sure the markdown content is located  under `src/pages`.

It is recommended to use a folder structure to define your site pages e.g. :

```
sandbox
├- src/pages [/]
│  ├- index.md
│  ├- alloy [/alloy/]
│  │  └- index.md
│  ├- consent [/consent/]
│  │  └- index.md
│  ├- eventmerge [/eventmerge/]
│  │  └- index.md
│  ├- personalization [/personalization/]
│  │  └- index.md
├- .env
├─ gatsby-config.js
└─ package.json
```

Using a folder structure with only `index.md` files gets you close to the final site build files. During the build process, Gatsby will transform the `md` files into `index.html` files.
The build files can be found in the `public` folder. Please read the [Overview of the Gatsby Build Process](https://www.gatsbyjs.com/docs/overview-of-the-gatsby-build-process/) for more information.

Here's a simple example of a content structure with `md` files and the resulting `html` files:

```
root
├- src/pages [/]
│  ├- index.md
│  ├- i_follow_recommendation [/i_follow_recommendation/]
│  │  └- index.md
│  └- i_dont_follow_recommendation.md [/i_dont_follow_recommendation/]
├- .env
├─ gatsby-config.js
└─ package.json
```

will output:

```
root
└- public
   ├- index.html
   ├- i_follow_recommendation
   │  └- index.html
   ├- i_dont_follow_recommendation
   │  └- index.html
   └- Minified JS, CSS files
```

You can exclude pages from the build by either moving them out of `src/pages` or by prefixing the filename with `_`.

### Assets

Images can be placed next to markdown pages inside `src/pages` and referenced using relative links. In this case, they'll be optimized during the build process and resulting file names are hashed to resolve potential caching issues.

Other asset types (e.g. PDFs etc.) can be placed inside a `static` folder at the root. Those assets are not being processed but simply copied into the `public` folder.

Here's a simple example of a content structure with a markdown page file and 2 different asset types:

```
root
├- src/pages [/]
│  ├- index.md
│  └- image.png
├- static [/]
│  └- document.pdf
├─ gatsby-config.js
└─ package.json
```

where `image.png` is referenced in `index.md` as an image:

```
![alt image](./image.png)
```

and `document.pdf` is referenced in `index.md` as a link:

```
[document](/document.pdf)
```

You'll find more information about the `static` folder at [Using the Static Folder](https://www.gatsbyjs.com/docs/how-to/images-and-media/static-folder/).

Please find guidance on ideal illustration sizes in this [document](docs/documents/MCS_Media_+_Image_Recommendations.pdf).


### Global Navigation

The Global navigation links are configurable in `gatsby-config.js` under `pages`.
If you follow the recommended [content structure](#content-structure), you can define the `path` value using the folder names.

For example, the following folder structure maps to the URL defined in brackets:

```
sandbox
├- src/pages [/]
│  ├- index.md
│  ├- alloy [/alloy/]
│  │  └- index.md
│  ├- consent [/consent/]
│  │  └- index.md
│  ├- eventmerge [/eventmerge/]
│  │  └- index.md
└- guides [/guides/]
   └─ index.md
```

then define your Global Navigation using `pages` in `gatsby-config.js`:

```
pages: [
      {
        title: "Consent",
        path: "/consent/index.md"
      },
      {
        title: "Personalization",
        path: "/personalization/index.md"
      },
      {
        title: "Event Merge",
        path: "/eventmerge/index.md"
      },
      {
        title: "Links",
        path: "/links/index.md"
      },
      {
        title: "Large Payload",
        path: "/largepayload/index.md"
      },
      {
        title: "Multiple Orgs",
        path: "/multipleorgs/index.md"
      },
      {
        title: "Legacy Visitor ID",
        path: "frame.md"
      }

```

You can also define it by pointing to the markdown files:

```
pages: [
  {
    title: 'Adobe Analytics',
    path: 'index.md'
  },
  {
    title: 'Guides',
    path: 'guides.md'
  },
  {
    title: 'API Reference',
    path: 'api.md'
  }
]
```

Search `?foo=bar` and hash `#foo` values are also supported.

The order in which the pages are defined is respected in the Global Navigation.

If the current location corresponds to a `path` defined under `pages`, the correspond tab in the Global Navigation is set as active.
Otherwise, the first defined tab is set as active by default.

## Deploying Alloyio.com

### Preview on GitHub Pages

To enable GitHub Pages, go to your repository settings under the GitHub Pages section, select the `gh-pages` branch as source and press Save. Your site will be available for preview at https://adobe.github.io/alloy.

On every commit to the `main` branch, the site will be built to GitHub Pages automatically, for you to preview as a development version. This is the default branch for new repos in GitHub.

### Deploy to Azure Storage Static Websites

You can manually trigger the deploy workflow by pressing the **Run workflow** button:

1. Go to your repository actions overview page i.e. https://github.com/ORG/REPOSITORY/actions
2. Click on the "Deploy" workflow
3. Press **Run workflow**. You can choose which branch the workflow is run on and specify the deployment type (`dev` for development or/and `prod` for production).

**Pre-requisites:**

1. Setting your `PATH_PREFIX` as explained [here](#adding-a-path-prefix). This is the sub-folder to deploy this micro-site to.
  * For example, if you want to deploy to `https://example.com/foo/bar`, you must set `PATH_PREFIX` to `/foo/bar/`
  * For sites deployed to the `root`, use `/` as the `PATH_PREFIX`
2. The person initiating the deploy workflow must have `write` access to the repository.

