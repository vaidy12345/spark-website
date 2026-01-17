/**
 * Waitlist form handler for Spark Marketing Site
 * Handles form submission to Firebase Cloud Function
 */

(function() {
    'use strict';

    const WAITLIST_FUNCTION_URL = 'https://us-central1-spark-website-waitlist-d1cf5.cloudfunctions.net/subscribeToWaitlist';

    /**
     * Show success message modal
     */
    function showSuccessModal() {
        const modal = document.getElementById('waitlist-modal');
        if (!modal) return;

        const form = modal.querySelector('form#waitlist-form');
        const description = modal.querySelector('p.text-slate-600');
        
        // Hide form, show success message
        if (form) {
            const successHtml = `
                <div class="text-center py-4">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h4 class="text-xl font-bold text-slate-900 mb-2">You're on the list!</h4>
                    <p class="text-slate-600">We'll notify you when Spark opens up for new educators.</p>
                </div>
            `;
            
            form.style.display = 'none';
            form.insertAdjacentHTML('afterend', successHtml);
        }
        
        // Hide description
        if (description) {
            description.style.display = 'none';
        }
        
        // Auto-close after 3 seconds, then reset
        setTimeout(() => {
            closeWaitlistModal();
            
            // Reset form after modal closes
            setTimeout(() => {
                if (form) {
                    form.style.display = 'block';
                    form.reset();
                    
                    // Remove success message if it exists
                    const successMsg = modal.querySelector('.text-center.py-4');
                    if (successMsg) {
                        successMsg.remove();
                    }
                    
                    // Restore description
                    if (description) {
                        description.style.display = 'block';
                    }
                    
                    // Re-enable form elements
                    const inputs = form.querySelectorAll('input, button');
                    inputs.forEach(el => el.disabled = false);
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.textContent = 'Join List';
                    }
                }
            }, 300);
        }, 3000);
    }

    /**
     * Show error message in modal
     */
    function showErrorModal(message) {
        const modal = document.getElementById('waitlist-modal');
        if (!modal) return;

        const form = modal.querySelector('form');
        const errorEl = form ? form.querySelector('.waitlist-error') : null;
        
        if (!errorEl) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'waitlist-error mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm';
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
            errorDiv.textContent = message;
            
            // Remove error after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        } else {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    }

    /**
     * Close waitlist modal
     */
    function closeWaitlistModal() {
        const modal = document.getElementById('waitlist-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Handle form submission
     */
    async function handleWaitlistSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const emailInput = form.querySelector('input[type="email"]');
        const nameInput = form.querySelector('input[name="name"]');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!emailInput) {
            console.error('[waitlist] Email input not found');
            return;
        }

        const email = emailInput.value.trim();
        const name = nameInput ? nameInput.value.trim() : null;

        if (!email) {
            showErrorModal('Please enter a valid email address');
            return;
        }

        // Disable form during submission
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Joining...';
        }
        emailInput.disabled = true;
        if (nameInput) nameInput.disabled = true;

        // Clear any previous errors
        const existingError = form.querySelector('.waitlist-error');
        if (existingError) {
            existingError.remove();
        }

        try {
            const response = await fetch(WAITLIST_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    ...(name && { name: name })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to join waitlist');
            }

            // Success
            showSuccessModal();

        } catch (error) {
            console.error('[waitlist] Submission error:', error);
            showErrorModal(error.message || 'Something went wrong. Please try again later.');
            
            // Re-enable form
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Join List';
            }
            emailInput.disabled = false;
            if (nameInput) nameInput.disabled = false;
        }
    }

    /**
     * Open waitlist modal
     */
    function openWaitlistModal() {
        const modal = document.getElementById('waitlist-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Close waitlist modal
     */
    function closeWaitlistModal() {
        const modal = document.getElementById('waitlist-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Initialize waitlist form handler and button listeners
     */
    function initWaitlistForm() {
        console.log('[waitlist] Initializing waitlist form handler');
        const modal = document.getElementById('waitlist-modal');
        if (!modal) {
            console.warn('[waitlist] Waitlist modal not found - retrying in 100ms');
            setTimeout(initWaitlistForm, 100);
            return;
        }

        console.log('[waitlist] Modal found, looking for form');
        const form = modal.querySelector('form#waitlist-form');
        if (!form) {
            console.warn('[waitlist] Form not found in modal - retrying in 100ms');
            setTimeout(initWaitlistForm, 100);
            return;
        }

        console.log('[waitlist] Form found, attaching submit handler');
        // Remove any existing listeners to avoid duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', handleWaitlistSubmit);
        console.log('[waitlist] Form handler attached successfully');

        // Attach click handlers to all "Join Waitlist" buttons
        const openButtons = document.querySelectorAll('button[onclick*="waitlist-modal"], a[href="#waitlist"]');
        openButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openWaitlistModal();
            });
            // Remove inline onclick to avoid conflicts
            if (btn.onclick) {
                btn.removeAttribute('onclick');
            }
            // Handle hash links
            if (btn.getAttribute('href') === '#waitlist') {
                btn.href = 'javascript:void(0)';
            }
        });

        // Attach close handler to backdrop and close button
        const backdrop = modal.querySelector('.backdrop-blur-sm');
        const closeBtn = modal.querySelector('button[onclick*="waitlist-modal"].absolute');
        if (backdrop) {
            backdrop.addEventListener('click', closeWaitlistModal);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeWaitlistModal);
            closeBtn.removeAttribute('onclick');
        }

        console.log('[waitlist] Button handlers attached');
    }

    // Initialize when DOM is ready (with delay to ensure layout.js has run)
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Small delay to let layout.js finish
                setTimeout(initWaitlistForm, 200);
            });
        } else {
            // DOM already loaded, but wait for layout.js
            setTimeout(initWaitlistForm, 200);
        }
    }

    initWhenReady();

})();

