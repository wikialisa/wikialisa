import { XMLBuilder, XMLParser, type X2jOptions, type XmlBuilderOptions } from "fast-xml-parser";

const PARSER_OPTIONS: X2jOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  cdataPropName: "__cdata",
};

const BUILDER_OPTIONS: XmlBuilderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
};

let _parser: XMLParser | null = null;
let _builder: XMLBuilder | null = null;

export function getParser(): XMLParser {
  if (!_parser) _parser = new XMLParser(PARSER_OPTIONS);
  return _parser;
}

export function getBuilder(): XMLBuilder {
  if (!_builder) _builder = new XMLBuilder(BUILDER_OPTIONS);
  return _builder;
}

export function parseISO20022XML(xml: string): Record<string, unknown> {
  return getParser().parse(xml) as Record<string, unknown>;
}

export function buildISO20022XML(obj: Record<string, unknown>): string {
  return getBuilder().build(obj) as string;
}

export function extractDocument(xml: string): Record<string, unknown> | undefined {
  const parsed = parseISO20022XML(xml) as { Document?: Record<string, unknown> };
  return parsed["Document"];
}

export function extractNamespace(xml: string): string | undefined {
  return xml.match(/xmlns="([^"]+)"/)?.[1];
}

export function extractMessageType(xml: string): string | undefined {
  const ns = extractNamespace(xml);
  if (!ns) return undefined;
  const parts = ns.split(":");
  return parts[parts.length - 1];
}
