import { createHashRouter } from "react-router"; // <-- Changed this import
import { Root } from "./Root";
import { Home } from "./Home";
import { CreateQuiz } from "./CreateQuiz";
import { EditQuiz } from "./EditQuiz";
import { NotFound } from "./NotFound";
import { TakeQuiz } from "./TakeQuiz";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { Settings } from "./Settings"; 
import { Library } from "./Library";   

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "create", Component: CreateQuiz },
      { path: "edit/:id", Component: EditQuiz },
      { path: "library", Component: Library },   
      { path: "settings", Component: Settings }, 
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/take/:id",
    Component: TakeQuiz
  },
  {
    path: "/login",
    Component: Login
  },
  {
    path: "/signup",
    Component: Signup
  }
]);