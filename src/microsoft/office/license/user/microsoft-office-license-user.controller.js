angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseUsersCtrl", class MicrosoftOfficeLicenseUsersCtrl {

    constructor (MicrosoftOfficeLicenseService, $stateParams, $scope, $timeout, Alerter) {
        this.license = MicrosoftOfficeLicenseService;
        this.$stateParams = $stateParams;
        this.currentLicense = $stateParams.serviceName;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.Alerter = Alerter;
    }

    $onInit () {
        this.$scope.$on("microsoft.office.license.user.add", () => this.delayedGetUsers());
        this.$scope.$on("microsoft.office.license.user.edit", () => this.delayedGetUsers());
        this.$scope.$on("microsoft.office.license.user.delete", () => this.delayedGetUsers());

        this.getUserIds();
    }

    transformItem (item) {
        return this.license.getUserDetails(this.$scope.currentLicense, item)
            .then((details) => {
                if (details.status !== "ok") {
                    details.isLoading = true;
                    this.license.pollUserDetails(this.$scope.currentLicense, item, this.$scope)
                        .then(() => this.delayedGetUsers())
                        .finally(() => { details.isLoading = false; });
                }
                return details;
            });
    }


    getUserIds () {
        this.users = null;

        return this.license.getUsers(this.currentLicense)
            .then((users) => { this.users = users.map((id) => ({ id })); })
            .catch((err) => this.Alerter.error(err.message, this.$scope.alerts.tabs));
    }

    delayedGetUsers () {
        return this.$timeout(() => this.getUserIds(), 250);
    }
});
