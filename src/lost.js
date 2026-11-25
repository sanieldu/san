import "./site.js";
import { boop, liveDoxie } from "./site.js";

// The 404 page shows him big, live from the start.
const dog = document.getElementById("lost-dog");
liveDoxie(dog);
dog.addEventListener("click", boop);
