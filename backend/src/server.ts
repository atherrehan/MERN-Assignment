import { app } from './app';
import { config } from './config/env';

app.listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
});
