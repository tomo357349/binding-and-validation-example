/**
 * bind options.
 */
function bindOptions() {
	/**
	 * The HTML form bound.
	 * @type {HTMLFormElement} form
	 */
	this.form = null;

	/**
	 * Input duration (milliseconds)
	 * @type {number}
	 */
	this.duration = 0;

	/**
	 * Callback after changing value.
	 *
	 * the first argument is property name.
	 * the second argument is property value. the value is always a string because the value get from the form control.
	 *
	 * @type {(string, string) => void}
	 */
	this.callback = (name, value) => {};

	/**
	 * bind non-form element. seeks bounded element by id that starts with this propertie's value.
	 *
	 * @type {string}
	 */
	this.idprefix = '';

	/**
	 * bounded form is used to set the :invalid pseudo-class. not the value.
	 *
	 * @type {boolean}
	 */
	this.asValidator = false;
}

/**
 * bind the object to the form elements or the other html elements.
 *
 * @param {any} obj
 * @param {bindOptions} opts
 */
export function bind(obj, opts) {
	opts = opts || {};
	const durationHndl = {};

	// monitors changes to the value of an input element,
	// changes the object's value accordingly, and calls back a change handling 'opts'.
	Object.keys(obj).forEach(key => {
		const el = (opts.form) ? opts.form.elements[key] : null;
		if (!el) return;

		if (el instanceof HTMLInputElement) {
			if (el.type === 'checkbox') {
				el.checked = (el.value === obj[key]);
				el.addEventListener('change', checkListener);
			} else {
				el.value = obj[key];
				el.addEventListener('input', inputListener);
			}
		} else if (el instanceof HTMLTextAreaElement) {
			el.value = obj[key];
			el.addEventListener('input', inputListener);
		} else if (el instanceof HTMLSelectElement) {
			el.value = obj[key];
			el.addEventListener('change', selectListener);
		}

		function inputListener() {
			if (opts.duration) {
				if (durationHndl[key]) clearTimeout(durationHndl[key]);
				durationHndl[key] = setTimeout(() => {
					changeValue();
				}, opts.duration);
			} else {
				changeValue();
			}

			function changeValue() {
				const value = el.value;
				setValue(key, value);
			}
		}

		function checkListener() {
			const value = el.checked ? el.value : '';
			setValue(key, value);
		}

		function selectListener() {
			const value = el.value;
			setValue(key, value);
		}

		function setValue(key, value) {
			obj[key] = value;
			if (opts.callback) opts.callback(key, value);
		}
	});

	// returns the proxy object.
	// that will watch the value of propery was changed,
	// and set new value to the form related.
	return new Proxy(obj, {
		set(target, p, newValue, receiver) {
			if (durationHndl[p]) clearTimeout(durationHndl[p]);

			target[p] = newValue;
			if (opts.idprefix) {
				const el = document.getElementById(opts.idprefix + p);
				if (el) el.textContent = newValue;
			}
			if (opts.form && opts.form[p]) {
				const el = opts.form[p];
				if (opts.asValidator) {
					el.setCustomValidity(newValue);
				} else {
					el.value = newValue;
				}
			}
			if (opts.callback) opts.callback(p, newValue);

			return true;
			// return Reflect.set(...arguments);
		}
	});
}
