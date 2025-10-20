import { diag, DiagConsoleLogger, DiagLogLevel, metrics } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { credentials } from '@grpc/grpc-js';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const normalizeGrpcEndpoint = (value: string | undefined) => {
  if (!value || value.trim().length === 0) {
    return 'localhost:4317';
  }
  return value.replace(/^https?:\/\//i, '').replace(/^grpc:\/\//i, '');
};

const traceExporter = new OTLPTraceExporter({
  url: normalizeGrpcEndpoint(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
  credentials: credentials.createInsecure(),
});

const prometheusExporter = new PrometheusExporter({
  port: Number(process.env.METRICS_PORT ?? 9464),
  startServer: false,
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'conforma-api',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'conforma',
    [SemanticResourceAttributes.SERVICE_VERSION]: 'phase5',
  }),
  traceExporter,
  metricReader: prometheusExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: false },
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

let initialized = false;

export const startTelemetry = async () => {
  if (initialized) {
    return;
  }
  await sdk.start();
  initialized = true;
};

export const shutdownTelemetry = async () => {
  if (!initialized) {
    return;
  }
  await sdk.shutdown();
  initialized = false;
};

export const prometheusRequestHandler = prometheusExporter.getMetricsRequestHandler();

export const telemetryMeter = metrics.getMeter('conforma-meter');
