import { getUserByName } from "../lib/db/queries/users";

(async () => {
  const user = await getUserByName("kahya");
  console.log("User found:", user);
})();
