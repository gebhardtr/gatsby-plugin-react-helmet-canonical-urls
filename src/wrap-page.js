const React = require('react');
const { Helmet } = require('react-helmet');

const defaultPluginOptions = {
  forceTrailingSlash: false,
  noTrailingSlash: false,
  noQueryString: false,
  noHash: false,
};

const isExcluded = (excludes, element) => {
  if (!Array.isArray(excludes)) return false;

  element = element.replace(/\/+$/, '');

  return excludes.some(exclude => {
    if (exclude instanceof RegExp) return element.match(exclude);
    return exclude.includes(element);
  });
};

module.exports = ({ element, props: { location } }, pluginOptions = {}) => {
  const options = Object.assign({}, defaultPluginOptions, pluginOptions);

  if (options.noTrailingSlash && options.forceTrailingSlash) {
    throw new Error('conflicting options: noTrailingSlash and forceTrailingSlash')
  }

  if (options.siteUrl && !isExcluded(options.exclude, location.pathname)) {
    let pathname = location.pathname || '/';

    if (
      options.noTrailingSlash &&
      pathname.endsWith('/') &&
      !options.forceTrailingSlash
    )
      pathname = pathname.substring(0, pathname.length - 1);

    if (options.forceTrailingSlash && !pathname.endsWith('/')) pathname += '/';

    let myUrl = `${options.siteUrl}${pathname}`;

    if (!options.noQueryString) myUrl += location.search;

    if (!options.noHash) myUrl += location.hash;

    return (
      <>
        <Helmet
          link={[
            {
              rel: 'canonical',
              key: myUrl,
              href: myUrl,
            },
          ]}
        />
        {element}
      </>
    );
  }

  return element;
};
