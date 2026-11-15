/**
 * Security Helper — default stub
 * Available as _s.helpers.Security.*
 *
 * domainSecurity is called by middleware on every request that carries
 * an Authorization header. Your app's Helpers/Security.js overrides it —
 * runStoatConfig.js merges your exports into _s.helpers.Security.
 *
 * v1.1.3: the stub fails closed. It only passes requests through in an
 * explicitly local environment ("development", "dev", "local", "test"), so
 * a deployed app without Helpers/Security.js no longer accepts any token.
 */

const DEV_ENVIRONMENTS = ["development", "dev", "local", "test"];
let warned = false;

const Security = {

    async domainSecurity(request) {
        const environment = String(_s?.config?.environment || "").toLowerCase();

        if (!DEV_ENVIRONMENTS.includes(environment)) {
            return {
                status : 2,
                message: "Token validation is not configured — add Helpers/Security.js with a domainSecurity() implementation",
            };
        }

        if (!warned) {
            warned = true;
            console.warn(
                `[Stoat Security] WARNING: domainSecurity is using the default pass-through stub ` +
                `(environment "${environment}"). Implement Helpers/Security.js before deploying.`
            );
        }
        return { status: 1, data: { source: "default" } };
    },
};

module.exports = Security;
