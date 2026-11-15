/**
 * Security Helper — default stub
 * Available as _s.helpers.Security.*
 *
 * domainSecurity is called by middleware on every request that carries
 * an Authorization header. This stub always passes so the framework
 * boots without configuration, but logs a warning in production.
 *
 * Override this in your app's Helpers/Security.js — the framework's
 * runStoatConfig.js merges your exports into _s.helpers.Security,
 * replacing these defaults. See TODOS.md SEC-5 for a full JWT example.
 */

const Security = {

    async domainSecurity(request) {
        if (_s?.config?.environment === "production") {
            console.warn(
                "[Stoat Security] WARNING: domainSecurity is using the default pass-through stub. " +
                "Implement Helpers/Security.js with real token validation before deploying to production."
            );
        }
        return { status: 1, data: { source: "default" } };
    },
};

module.exports = Security;
