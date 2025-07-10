import { testConnection } from "../lib/db";
await testConnection(); // actually runs the check
import { fetchFeed } from "./rss";
import { addfeed,middlewareLoggedIn,showFeed } from "./command";
import { handlerRegister, registerCommand, runCommand, CommandsRegistry, handlerLogin, handlerReset, handlerListusers, handlerAggreggate,handlerFollow, handlerFollowing, handlerUnfollow, handlerBrowse } from "./command";

const commandsRegistry: CommandsRegistry = {};
await registerCommand(commandsRegistry, "register", handlerRegister);
await registerCommand(commandsRegistry, "login", handlerLogin);
await registerCommand(commandsRegistry, "reset", handlerReset);
await registerCommand(commandsRegistry, "users", handlerListusers);
await registerCommand(commandsRegistry, "agg", handlerAggreggate);
await registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(addfeed));
await registerCommand(commandsRegistry, "feeds", showFeed);
await registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow));
await registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerFollowing));
await registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow));
registerCommand(commandsRegistry, "browse", handlerBrowse);


const [, , cmdName, ...args] = process.argv;

(async () => {
  try {
    if (cmdName) {
      await runCommand(commandsRegistry, cmdName, ...args);

    } else {
      console.error("No command provided.");
      process.exit(1);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
  process.exit(0);

})();
