import { format } from './utils'
import type { Config } from './config'
import { TemplateContext } from './generator'

type TemplateTag =
  | 'tsrImports'
  | 'tsrPath'
  | 'tsrExportStart'
  | 'tsrExportEnd'
  | 'tsrComponent'

export function fillTemplate(
  config: Config,
  template: string,
  values: Record<TemplateTag, string>,
) {
  const replaced = template.replace(
    /%%(\w+)%%/g,
    (_, key) => values[key as TemplateTag] || '',
  )
  return format(replaced, config)
}

export type TargetTemplate = {
  fullPkg: string
  subPkg: string
  rootRoute: {
    template: () => string
    imports: {
      tsrImports: () => string
      tsrExportStart: () => string
      tsrExportEnd: () => string
      tsrComponent: (context: TemplateContext) => string
    }
  }
  route: {
    template: () => string
    imports: {
      tsrImports: (context: TemplateContext) => string
      tsrExportStart: (routePath: string) => string
      tsrExportEnd: () => string
      tsrComponent: (context: TemplateContext) => string
    }
  }
  lazyRoute: {
    template: () => string
    imports: {
      tsrImports: (context: TemplateContext) => string
      tsrExportStart: (routePath: string) => string
      tsrExportEnd: () => string
      tsrComponent: (context: TemplateContext) => string
    }
  }
}

export function getTargetTemplate(config: Config): TargetTemplate {
  const target = config.target
  switch (target) {
    case 'react':
      return {
        fullPkg: '@tanstack/react-router',
        subPkg: 'react-router',
        rootRoute: {
          template: () =>
            [
              'import * as React from "react"\n',
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RootComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: () =>
              "import { Outlet, createRootRoute } from '@tanstack/react-router';",
            tsrExportStart: () => 'export const Route = createRootRoute(',
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) =>
              `function RootComponent() { return (<React.Fragment><div>Hello "${routePath}"!</div><Outlet /></React.Fragment>) }`,
          },
        },
        route: {
          template: () =>
            [
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: ({ routeComponentFileName }) => {
              const defaultImport =
                config.verboseFileRoutes === false
                  ? ''
                  : "import { createFileRoute } from '@tanstack/react-router';"
              return [
                defaultImport,
                `${routeComponentFileName ? `import RouteComponent from './${routeComponentFileName}';` : ''}`,
              ].join('\n')
            },
            tsrExportStart: (routePath) =>
              config.verboseFileRoutes === false
                ? 'export const Route = createFileRoute('
                : `export const Route = createFileRoute('${routePath}')(`,
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) => {
              return `function RouteComponent() { return <div>Hello "${routePath}"!</div> }`
            },
          },
        },
        lazyRoute: {
          template: () =>
            [
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: ({ routeComponentFileName }) => {
              const defaultImport =
                config.verboseFileRoutes === false
                  ? ''
                  : "import { createLazyFileRoute } from '@tanstack/react-router';"
              return [
                defaultImport,
                `${routeComponentFileName ? `import RouteComponent from './${routeComponentFileName}';` : ''}`,
              ].join('\n')
            },
            tsrExportStart: (routePath) =>
              config.verboseFileRoutes === false
                ? 'export const Route = createLazyFileRoute('
                : `export const Route = createLazyFileRoute('${routePath}')(`,
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) => {
              return `function RouteComponent() { return <div>Hello "${routePath}"!</div> }`
            },
          },
        },
      }
    case 'solid':
      return {
        fullPkg: '@tanstack/solid-router',
        subPkg: 'solid-router',
        rootRoute: {
          template: () =>
            [
              'import * as Solid from "solid-js"\n',
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RootComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: () =>
              "import { Outlet, createRootRoute } from '@tanstack/solid-router';",
            tsrExportStart: () => 'export const Route = createRootRoute(',
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) =>
              `function RootComponent() { return (<><div>Hello "${routePath}"!</div><Outlet /></>) }`,
          },
        },
        route: {
          template: () =>
            [
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: ({ routeComponentFileName }) => {
              const defaultImport =
                config.verboseFileRoutes === false
                  ? ''
                  : "import { createFileRoute } from '@tanstack/solid-router';"
              return [
                defaultImport,
                `${routeComponentFileName ? `import RouteComponent from './${routeComponentFileName}';` : ''}`,
              ].join('\n')
            },
            tsrExportStart: (routePath) =>
              config.verboseFileRoutes === false
                ? 'export const Route = createFileRoute('
                : `export const Route = createFileRoute('${routePath}')(`,
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) => {
              return `function RouteComponent() { return <div>Hello "${routePath}"!</div> }`
            },
          },
        },
        lazyRoute: {
          template: () =>
            [
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: ({ routeComponentFileName }) => {
              const defaultImport =
                config.verboseFileRoutes === false
                  ? ''
                  : "import { createLazyFileRoute } from '@tanstack/solid-router';"
              return [
                defaultImport,
                `${routeComponentFileName ? `import RouteComponent from './${routeComponentFileName}';` : ''}`,
              ].join('\n')
            },

            tsrExportStart: (routePath) =>
              config.verboseFileRoutes === false
                ? 'export const Route = createLazyFileRoute('
                : `export const Route = createLazyFileRoute('${routePath}')(`,

            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) => {
              return `function RouteComponent() { return <div>Hello "${routePath}"!</div> }`
            },
          },
        },
      }
    case 'vue':
      return {
        fullPkg: '@tanstack/vue-router',
        subPkg: 'vue-router',
        rootRoute: {
          template: () =>
            [
              'import { h } from "vue"\n',
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RootComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: () =>
              "import { Outlet, createRootRoute } from '@tanstack/vue-router';",
            tsrExportStart: () => 'export const Route = createRootRoute(',
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) =>
              `function RootComponent() { return h("div", {}, "Hello \\"${routePath}\\"!") }`,
          },
        },
        route: {
          template: () =>
            [
              'import { h } from "vue"\n',
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: () =>
              config.verboseFileRoutes === false
                ? ''
                : "import { createFileRoute } from '@tanstack/vue-router';",
            tsrExportStart: (routePath) =>
              config.verboseFileRoutes === false
                ? 'export const Route = createFileRoute('
                : `export const Route = createFileRoute('${routePath}')(`,
            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) =>
              `function RouteComponent() { return h("div", {}, "Hello \\"${routePath}\\"!") }`,
          },
        },
        lazyRoute: {
          template: () =>
            [
              'import { h } from "vue"\n',
              '%%tsrImports%%',
              '\n\n',
              '%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n',
              '%%tsrComponent%%\n',
            ].join(''),
          imports: {
            tsrImports: () =>
              config.verboseFileRoutes === false
                ? ''
                : "import { createLazyFileRoute } from '@tanstack/vue-router';",

            tsrExportStart: (routePath) =>
              config.verboseFileRoutes === false
                ? 'export const Route = createLazyFileRoute('
                : `export const Route = createLazyFileRoute('${routePath}')(`,

            tsrExportEnd: () => ');',
            tsrComponent: ({ routePath }) =>
              `function RouteComponent() { return h("div", {}, "Hello \\"${routePath}\\"!") }`,
          },
        },
      }
    default:
      throw new Error(`router-generator: Unknown target type: ${target}`)
  }
}
