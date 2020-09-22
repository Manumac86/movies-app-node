const Sentry = require("@sentry/node");
const { Integrations } = require("@sentry/tracing");
const { config } = require("../../config");
const isRequestAjaxOrApi = require('../isRequestAjaxOrApi');

Sentry.init({
  dsn: `https://${config.sentryDns}@o450366.ingest.sentry.io/${config.sentryId}`,
  integrations: [
    new Integrations.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});


function logErrors(err, req, res, next) {
  Sentry.captureException(err);
  console.log(err.stack);
  next(err);
};

function clientErrorHandler(err, req, res, next) {
  // Catch errors for AJAX requests
  Sentry.captureException(err);

  // catch errors for AJAX request or if an error ocurrs while streaming
  if (isRequestAjaxOrApi(req) || res.headersSent) {
    res.status(500).json({ err: err.message });
  } else {
    next(err);
  }
};

function errorHandler(err, req, res, next) {
  Sentry.captureException(err);
  // Catch errors while streaming
  if (res.headersSent) {
    next(err);
  }

  if (!config.dev) {
    delete err.stack;
  }

  res.status(err.status || 500).json({ Error: err.message });
  res.render("error", { error: err });
};

module.exports = {
  logErrors,
  clientErrorHandler,
  errorHandler
};