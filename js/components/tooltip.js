/**
 * Reusable Tooltip component for marketing pages.
 * 
 * Usage:
 * <span class="tooltip-container" data-tooltip>
 *   <button class="tooltip-trigger" aria-label="...">?</button>
 *   <div class="tooltip">
 *     <span class="tooltip-title">Title</span>
 *     <span class="tooltip-content">Content</span>
 *   </div>
 * </span>
 */

function initTooltips() {
    const containers = document.querySelectorAll('[data-tooltip]');
    
    containers.forEach((container, index) => {
        const trigger = container.querySelector('.tooltip-trigger');
        const tooltip = container.querySelector('.tooltip');
        
        if (!trigger || !tooltip) return;

        // Set up accessibility
        const tooltipId = `tooltip-${index}`;
        tooltip.id = tooltipId;
        tooltip.setAttribute('role', 'tooltip');
        trigger.setAttribute('aria-describedby', tooltipId);

        // Handle mobile positioning context
        // We look for a parent that should act as the anchor on mobile (like an <li>)
        const mobileRoot = container.closest('[data-tooltip-mobile-root]') || container.parentElement;
        if (mobileRoot) {
            mobileRoot.classList.add('tooltip-mobile-root');
        }

        // Toggle on click for mobile (since hover isn't reliable)
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 640) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other tooltips
                document.querySelectorAll('[data-tooltip]').forEach(c => {
                    if (c !== container) c.classList.remove('is-active');
                });
                
                container.classList.toggle('is-active');
            }
        });
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('[data-tooltip].is-active').forEach(c => {
            c.classList.remove('is-active');
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('[data-tooltip].is-active').forEach(c => {
                c.classList.remove('is-active');
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', initTooltips);

