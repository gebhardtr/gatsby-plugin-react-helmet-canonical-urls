const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Helmet } = require('react-helmet');
const wrap = require('./wrap-page');

it('should set canonical', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '/pathname/',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('http://my-site.com/pathname/?search#hash');
});

it('should use a slash as pathname, if it is falsy', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('http://my-site.com/?search#hash');
});

it('should element set canonial, it should use it', () => {
  const canonical = 'https://this-is-a.canonical.test/more-test';
  const element = wrap(
    {
      element: React.createElement(Helmet, {
        link: [{ rel: 'canonical', key: canonical, href: canonical }],
      }),
      props: {
        location: {
          pathname: '/example/',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('https://this-is-a.canonical.test/more-test');
});

it('should remove trailing slash, if `noTrailingSlash` option is used', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '/pathname/',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
      noTrailingSlash: true,
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('http://my-site.com/pathname?search#hash');
});

it('should remove query string, if `noQueryString` option is used', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '/pathname/',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
      noQueryString: true,
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('http://my-site.com/pathname/#hash');
});

it('should remove hash, if `noHash` option is used', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '/pathname/',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
      noHash: true,
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('http://my-site.com/pathname/?search');
});

it('should not set canonical if no options is passed', () => {
  const element = wrap({
    element: 'element',
    props: {
      location: {},
    },
  });

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(0);
});

it('should not set canonical if no siteUrl option is passed', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {},
      },
    },
    {}
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(0);
});

test.each([
  [['/my-pathname']],
  [['/something', '/my-pathname']],
  [[/pathname/]],
  [[/^not/, /pathname/]],
  [[new RegExp('pathname')]],
])('should not set canonical if pathname is excluded: %p', exclude => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '/my-pathname/',
          search: '',
          hash: '',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
      exclude,
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(0);
});

it('should add a trailing slash and honor query and hash, if `forceTrailingSlash` option is used', () => {
  const element = wrap(
    {
      element: 'element',
      props: {
        location: {
          pathname: '/pathname',
          search: '?search',
          hash: '#hash',
        },
      },
    },
    {
      siteUrl: 'http://my-site.com',
      forceTrailingSlash: true,
    }
  );

  ReactDOMServer.renderToString(element);

  const link = Helmet.renderStatic().link.toComponent();
  expect(link.length).toBe(1);
  expect(link[0].props.href).toBe('http://my-site.com/pathname/?search#hash');
});

it('should throw an error if conflicting options are specified', () => {
  expect(() => {
    wrap(
      {
        element: 'element',
        props: {
          location: {
            pathname: '/pathname',
            search: '?search',
            hash: '#hash',
          },
        },
      },
      {
        siteUrl: 'http://my-site.com',
        forceTrailingSlash: true,
        noTrailingSlash: true,
      }
    );
  }).toThrowError(
    new Error('conflicting options: noTrailingSlash and forceTrailingSlash')
  );
});
