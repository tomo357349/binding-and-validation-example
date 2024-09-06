export function validator(obj, rules, results) {
	return new Proxy(obj, {
		set(target, p, newValue, receiver) {
			try {
				if (rules[p]) {
					const result = validate(rules[p], target, p, newValue, results);
					if (results) results[p] = result;
				}
				target[p] = newValue;
				return true;
				// return Reflect.set(...arguments);
			} catch (err) {
				console.log(err);
				return false;
			}
		}
	});
}

/**
 * built-in validate rules.
 */
export const builtinRules = {
	required: (target, p, value, datatype, args, results) => (!value) ? 'Required.' : '',
	date: (target, p, value, datatype, args, results) => (value && !parseDate(value, args[0])) ? 'Invalid Format.' : '',
	number: (target, p, value, datatype, args, results) => {
		if (!value) return;
		const num = +value;
		if (isNaN(num)) return 'Invalid Format.';
		return '';
	},
	lower: (target, p, value, datatype, args, results) => {
		const q = args[0];
		results[q] = '';
		const pv = parseValue(value, datatype);
		const qv = parseValue(target[q], datatype);
		return (pv && pv >= qv) ? 'Input Lower.' : '';
	},
	higher: (target, p, value, datatype, args, results) => {
		const q = args[0];
		results[q] = '';
		const pv = parseValue(value, datatype);
		const qv = parseValue(target[q], datatype);
		return (pv && pv <= qv) ? 'Input Higher.' : '';
	},
	lowereq: (target, p, value, datatype, args, results) => {
		const q = args[0];
		results[q] = '';
		const pv = parseValue(value, datatype);
		const qv = parseValue(target[q], datatype);
		return (pv && pv > qv) ? 'Input Lower Than Or Equal.' : '';
	},
	highereq: (target, p, value, datatype, args, results) => {
		const q = args[0];
		results[q] = '';
		const pv = parseValue(value, datatype);
		const qv = parseValue(target[q], datatype);
		return (pv && pv < qv) ? 'Input Greater Than Or Equal.' : '';
	},
};

/**
 * ruletoken format: "<rule>(^<argument>)(:<datatype>)"
 *
 * - example 1. "required"
 * - example 2. "number"
 *
 *
 * @param {any[]} ruletokens
 * @param {any} target
 * @param {string} p
 * @param {string} value
 * @param {results}
 */
function validate(ruletokens, target, p, value, results) {
	return ruletokens.map(ruletoken => {
		if (typeof(ruletoken) === 'string') {
			const [rule, datatype] = ruletoken.split(':');
			const ruleargs = rule.split('^');
			const rulename = ruleargs.shift();
			if (builtinRules[rulename]) return builtinRules[rulename](target, p, value, datatype, ruleargs, results);
			return '';
		} else if (typeof(ruletoken) === 'function') {
			return rule(target, p, value, results);
		}
	}).join('');
}

function parseValue(value, datatype) {
	if (!datatype) return value;
	if (datatype === 'number') return value ? +value : 0;
	if (datatype === 'date') return value ? new Date(value) : null;
}

function parseDate(s, fmt) {
	// TODO:
	return new Date();
}