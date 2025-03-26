import Project from "./project/model";
import projectFeedback from "./feedback/model";
import projectFile from "./files/model";
import projectGrade from "./grades/model";
import projectRoutes from "./routes";

import "./project/model-associations";
import "./feedback/model-associations";
import "./files/model-associations";
import "./grades/model-associations";

export { Project, projectFeedback, projectFile, projectGrade, projectRoutes };

export default Project;
