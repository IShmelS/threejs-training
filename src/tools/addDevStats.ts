import * as Stats from 'stats.js';

/**
 * @param {number} panelIndex - 0: fps, 1: ms, 2: mb, 3+: custom
 *
 *
 */
export const addDevStats = (panelIndex = 0) => {
    const stats = new Stats();
    stats.showPanel(panelIndex);
    document.body.appendChild(stats.dom);

    return stats;
};
