import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { IConnectorState } from "./reducers/connector";

export default createNavigableModuleConfig<"pronote", IConnectorState>({
  name: "pronote",
  displayName: "Pronote",
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes("PRONOTE"),
  entcoreScope: ['pronote'],
  iconName: "pronote",
  iconColor: "#763294",
});
