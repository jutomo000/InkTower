import { EntityManager } from '../EntityManager';

export class UpgradeUI {
  private container: HTMLElement;
  private manager: EntityManager;
  private currentTab: string = '攻';
  private isOpen: boolean = false;

  constructor(containerId: string, manager: EntityManager) {
    this.container = document.getElementById(containerId)!;
    this.manager = manager;
    this.init();
  }

  private init() {
    this.container.innerHTML = `
      <div class="currency-display">墨: <span id="ink-amount">0</span></div>
      <div class="elements-bar" id="elements-bar">
        <div class="element-btn" data-type="火">火</div>
        <div class="element-btn" data-type="水">水</div>
        <div class="element-btn" data-type="木">木</div>
        <div class="element-btn" data-type="金">金</div>
        <div class="element-btn" data-type="土">土</div>
      </div>
      <button class="toggle-ui-btn" id="toggle-ui">修</button>
      <div class="upgrade-panel" id="upgrade-panel">
        <div class="tabs">
          <div class="tab active" data-tab="攻">攻</div>
          <div class="tab" data-tab="防">防</div>
          <div class="tab" data-tab="术">术</div>
        </div>
        <div class="upgrade-list" id="upgrade-list"></div>
      </div>
    `;

    document.getElementById('toggle-ui')!.onclick = () => this.toggle();
    
    this.container.querySelectorAll('.element-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = (e.target as HTMLElement).dataset.type;
        if (type) this.manager.triggerElement(type as any);
      });
    });
    
    this.container.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        this.currentTab = target.dataset.tab!;
        this.updateTabs();
        this.renderUpgrades();
      });
    });

    this.renderUpgrades();
  }

  private toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('upgrade-panel')!.classList.toggle('active', this.isOpen);
    document.getElementById('toggle-ui')!.textContent = this.isOpen ? 'X' : '修';
  }

  private updateTabs() {
    this.container.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', (tab as HTMLElement).dataset.tab === this.currentTab);
    });
  }

  public updateCurrency(amount: number) {
    const el = document.getElementById('ink-amount');
    if (el) el.textContent = Math.floor(amount).toString();
  }

  private renderUpgrades() {
    const list = document.getElementById('upgrade-list')!;
    list.innerHTML = '';

    const upgrades = this.getUpgradesForTab(this.currentTab);
    upgrades.forEach(up => {
      const item = document.createElement('div');
      item.className = 'upgrade-item';
      item.innerHTML = `
        <div class="upgrade-info">
          <h3>${up.name} [Lv.${up.level}]</h3>
          <p>${up.desc}</p>
        </div>
        <button class="buy-btn" data-id="${up.id}">${up.cost} 墨</button>
      `;
      
      const btn = item.querySelector('.buy-btn') as HTMLButtonElement;
      if (this.manager.currency < up.cost) {
        btn.style.opacity = '0.5';
        btn.disabled = true;
      }
      
      btn.onclick = () => {
        if (this.manager.buyUpgrade(up.id)) {
          this.renderUpgrades();
        }
      };
      
      list.appendChild(item);
    });
  }

  private getUpgradesForTab(tab: string) {
    // This will be connected to the manager's state
    return this.manager.getUpgradesByTab(tab);
  }

  public refresh() {
    if (this.isOpen) {
      this.renderUpgrades();
    }
    this.updateCurrency(this.manager.currency);
    this.updateElementCooldowns();
  }

  private updateElementCooldowns() {
    const cooldowns = this.manager.getElementCooldowns();
    this.container.querySelectorAll('.element-btn').forEach(btn => {
      const type = (btn as HTMLElement).dataset.type as any;
      const cd = cooldowns[type] || 0;
      const btnEl = btn as HTMLElement;
      if (cd > 0) {
        btnEl.classList.add('cooldown');
        const percent = (cd / 30) * 100; // Assuming 30s max cooldown
        btnEl.style.setProperty('--cd-percent', `${percent}%`);
        // Using a pseudo-element style via inline style for the transform
        const overlay = btnEl.querySelector('.cd-overlay') || document.createElement('div');
        if (!overlay.classList.contains('cd-overlay')) {
          overlay.className = 'cd-overlay';
          btnEl.appendChild(overlay);
        }
        (overlay as HTMLElement).style.height = `${percent}%`;
      } else {
        btnEl.classList.remove('cooldown');
        const overlay = btnEl.querySelector('.cd-overlay');
        if (overlay) (overlay as HTMLElement).style.height = '0%';
      }
    });
  }
}
