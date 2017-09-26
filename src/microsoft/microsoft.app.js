angular.module("Module.microsoft", [
    "ovh-utils-angular",
    "ngRoute",
    "ui.bootstrap",
    "ngSanitize",
    "Module.microsoft.controllers",
    "Module.microsoft.services"
]).config(["$stateProvider", function ($stateProvider) {
    "use strict";

    $stateProvider.state("web.microsoft.office", {
        "abstract": true,
        template: "<div ui-view></div>"
    });

    $stateProvider.state("web.microsoft.office.product", {
        url: "/configuration/microsoft/office/license/:serviceName?tab",
        templateUrl: "microsoft/office/license/microsoft-office-license.html",
        controller: "MicrosoftOfficeLicenseCtrl",
        controllerAs: "MicrosoftOfficeLicenseCtrl",
        reloadOnSearch: false,
        params: {
            tab: null
        },
        resolve: {
            navigationInformations: ["Navigator", "$rootScope", function (Navigator, $rootScope) {
                $rootScope.currentSectionInformation = "microsoft";
                return Navigator.setNavigationInformation({
                    leftMenuVisible: true,
                    configurationSelected: true
                });
            }],
            translator: ["translator", function (translator) {
                return translator.load(["microsoft"]).then(() => translator);
            }]
        }
    });
}]).run(["translator", "MicrosoftOfficeLicenseService", function (translator) {
    "use strict";
    translator.load(["microsoft"]);
}]).constant("MICROSOFT_GUIDE_URLS", {});
