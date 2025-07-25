import * as yaml from "js-yaml";

export default function parseYaml(text: string) {
  return yaml.load(text);
}
