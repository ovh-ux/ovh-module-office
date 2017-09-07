angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseEditCtrl", class MicrosoftOfficeLicenseEditCtrl {

    constructor (Alerter, MicrosoftOfficeLicenseService, $rootScope, $scope) {
        this.alerter = Alerter;
        this.licenseService = MicrosoftOfficeLicenseService;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
    }

    $onInit () {
        this.tenant = angular.copy(this.$scope.currentActionData.tenant);
        this.license = this.$scope.currentActionData.license;
        this.loaders = {
            edit: false
        };

        this.$scope.edit = () => {
            this.loaders.edit = true;

            return this.licenseService.edit(this.license, this.tenant)
                .then((tenant) => {
                    this.alerter.success(this.$scope.tr("microsoft_office_license_edit_success"), this.$scope.alerts.dashboard);
                    this.$rootScope.$broadcast("change.displayName", [this.license, this.tenant.displayName]);
                    return tenant;
                })
                .catch((err) => {
                    this.alerter.alertFromSWS(this.tr("microsoft_office_license_edit_error"), this.$scope.alerts.dashboard);
                    return err;
                })
                .finally(() => {
                    this.loaders.edit = false;
                    this.$rootScope.$broadcast("microsoft.office.license.edit");
                    this.$scope.resetAction();
                });
        };
    }
});
