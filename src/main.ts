import './style.css'
import { Engine } from './engine'
import { EntityManager } from './game/EntityManager'
import { UpgradeUI } from './game/ui/UpgradeUI'

const engine = new Engine('game-canvas');
const entityManager = new EntityManager(engine.width, engine.height);
const ui = new UpgradeUI('ui-layer', entityManager);

// Load Google Font (Noto Serif SC for that ink-wash feel)
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

link.onload = () => {
  console.log('Fonts loaded, starting engine...');
  engine.start(
    (dt) => {
      entityManager.update(dt, engine.width, engine.height);
      ui.refresh();
    },
    (ctx) => {
      entityManager.render(ctx);
    }
  );
};
