import DOMPurify from "dompurify";
import { jsParamsStore } from "../../store";

export class JSRouter {
  constructor (routes, expectedParams) {
    this.routes = routes || [];
    this.expectedParams = new Set(expectedParams || []);
    window.addEventListener("popstate", this.handlePopState.bind(this));
    this.handlePopState(); // Initial load
  }

  handlePopState() {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const queryParams = this.parseQueryParams(currentSearch);

    const matchingRoute = this.findMatchingRoute(currentPath, this.routes);

    if (matchingRoute) {
      if (matchingRoute.routeto) {
        this.navigate(matchingRoute.routeto);
        return;
      }

      const sanitizedParams = this.filterAndSanitizeParams(matchingRoute.params);
      jsParamsStore.getState().setParams(sanitizedParams);
      jsParamsStore.getState().setQuery(queryParams);

      const errorElement = document.createElement("div");

      if (matchingRoute.element) {
        matchingRoute.element(errorElement, sanitizedParams, queryParams);
      }

      if (matchingRoute.children) {
        const nestedPath = currentPath.slice(matchingRoute.path.length);
        const childElement = errorElement.querySelector("#child");
        if (childElement) {
          this.renderChildren(
            matchingRoute.children,
            nestedPath,
            childElement,
            sanitizedParams,
            queryParams
          );
        }
      }
    } else {
      const notFoundRoute = this.findMatchingRoute("*", this.routes);
      if (notFoundRoute) {
        const fallbackParams = this.filterAndSanitizeParams(notFoundRoute.params);
        jsParamsStore.getState().setParams(fallbackParams);
        jsParamsStore.getState().setQuery(queryParams);

        const errorElement = document.createElement("div");
        if (notFoundRoute.element) {
          notFoundRoute.element(errorElement, fallbackParams, queryParams);
        }
      }
    }
  }

  renderChildren(children, nestedPath, parentElement, parentParams, queryParams) {
    if (!children || children.length === 0) {
      const childElement = parentElement.querySelector("#child");
      if (childElement) childElement.remove();
      return;
    }

    const matchingChild = this.findMatchingRoute(nestedPath, children);
    if (matchingChild) {
      const childElement = document.createElement("div");
      childElement.id = "child";
      const mergedParams = { ...parentParams, ...matchingChild.params };
      const sanitizedParams = this.filterAndSanitizeParams(mergedParams);

      jsParamsStore.getState().setParams(sanitizedParams);
      jsParamsStore.getState().setQuery(queryParams);

      if (matchingChild.element) {
        matchingChild.element(childElement, sanitizedParams, queryParams);
      }
      parentElement.appendChild(childElement);

      if (matchingChild.children) {
        const nextNestedPath = nestedPath.slice(matchingChild.path.length);
        this.renderChildren(
          matchingChild.children,
          nextNestedPath,
          childElement,
          sanitizedParams,
          queryParams
        );
      }
    }
  }

  parseQueryParams(search) {
    const queryParams = {};
    const urlSearchParams = new URLSearchParams(search);

    for (const [key, value] of urlSearchParams.entries()) {
      if (this.expectedParams.has(key)) {
        queryParams[key] = DOMPurify.sanitize(value);
      }
    }

    return queryParams;
  }

  findMatchingRoute(path, routes, inheritedParams = {}) {
    for (const route of routes) {
      const routePath = route.path;
      const isDefaultRoute = routePath === "*";

      if (!isDefaultRoute) {
        const paramNames = [];
        const regexPattern = routePath.replace(/:[^\s/]+/g, match => {
          paramNames.push(match.substring(1));
          return "([^\\s/]+)";
        });

        const regex = new RegExp(`^${regexPattern}(?:/|$)`);
        const match = path.match(regex);

        if (match) {
          const params = { ...inheritedParams };
          paramNames.forEach((name, index) => {
            params[name] = match[index + 1] ?? "";
          });

          if (route.children) {
            const nestedPath = path.slice(match[0].length);
            const matchingChild = this.findMatchingRoute(
              nestedPath,
              route.children,
              params
            );
            if (matchingChild) return matchingChild;
          }

          return { ...route, params };
        }
      } else {
        return route;
      }
    }

    return undefined;
  }

  filterAndSanitizeParams(params) {
    if (!params) return {};
    const sanitizedParams = {};
    for (const key in params) {
      if (this.expectedParams.has(key)) {
        sanitizedParams[key] = DOMPurify.sanitize(params[key] ?? "");
      }
    }
    return sanitizedParams;
  }

  navigate(path) {
    history.pushState(null, "", path);
    this.handlePopState();
  }

  addRoute(route) {
    this.routes.push(route);
  }
}
