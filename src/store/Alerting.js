export default {
    state: {
        alerts: [],
        category: "alert-info",
        isDismissable: true,
        isConfirmable: false,
        position: "top-center",
        fadeOut: null,
        uuid: 0
    },

    mutations: {
        /**
         * Adds an alert to state if the message to report is not a duplicate.
         * @param {object} state - vuex store
         * @param {object} newAlert - new alert
         * @returns {void}
         */
        addAlert (state, newAlert) {
            const findAlert = state.alerts.find(alert => {
                return alert.message.trim() === newAlert.message.trim();
            });

            if (findAlert === undefined) {
                state.alerts.push(newAlert);
            }
        },

        /**
         * Update the uuid + 1.
         * @param {object} state  - vuex store
         * @returns {void}
         */
        updateUuid (state) {
            state.uuid += 1;
        },

        /**
         * Removes an alert by a given Id.
         * @param {object} state - vuex store
         * @param {string} removeAlertId - Id of the alert to be removed
         * @returns {void}
         */
        removeAlertById (state, removeAlertId) {
            state.alerts = state.alerts.filter(alert => {
                return alert.id !== removeAlertId;
            });
        },

        /**
         * Clears the state alerts.
         * @param {object} state - vuex store
         * @returns {void}
         */
        removeAlerts (state) {
            state.alerts = [];
        }
    },

    actions: {
        /**
         * Adds an alert to store.
         * @param {ActionContext} param0 - context passed by vuex
         * @param {string} alert - message to alert
         * @param {string} uuid - uuid for alert
         * @returns {void}
         */
        addAlert ({state, commit}, alert) {
            const newAlert = {
                id: "alert_" + state.uuid,
                message: "",
                category: state.category,
                isDismissable: state.isDismissable,
                isConfirmable: state.isConfirmable
            };

            if (typeof alert === "string") {
                newAlert.message = alert;
            }
            else if (typeof alert === "object") {
                newAlert.message = alert.text;
                if (alert.hasOwnProperty("id") === true) {
                    newAlert.id = String(alert.id);
                }
                if (alert.hasOwnProperty("kategorie") === true) {
                    newAlert.category = alert.kategorie;
                }
                if (alert.hasOwnProperty("dismissable") === true) {
                    newAlert.isDismissable = alert.dismissable;
                }
                if (alert.hasOwnProperty("confirmable") === true) {
                    newAlert.isConfirmable = alert.confirmable;
                }
                if (alert.hasOwnProperty("fadeOut") === true) {
                    newAlert.fadeOut = alert.fadeOut;
                }
            }

            commit("updateUuid");
            commit("addAlert", newAlert);
        },

        /**
         * Removes one alert by id or all alerts from store.
         * @param {ActionContext} param0 - context passed by vuex
         * @param {string} [removeAlertId=""] - Id of the alert to be deleted.
         * @returns {void}
         */
        removeAlert ({commit}, removeAlertId = "") {
            if (removeAlertId !== "") {
                commit("removeAlertById", String(removeAlertId));
            }
            else {
                commit("removeAlerts");
            }
        }
    }
};
