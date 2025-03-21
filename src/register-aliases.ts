import path from "path";
import moduleAlias from "module-alias";

// Register aliases
moduleAlias.addAliases({
  "@": path.join(__dirname, "./"),
});
