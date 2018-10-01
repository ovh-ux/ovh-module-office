angular.module('Module.microsoft', [
  'ovh-utils-angular',
  'ngRoute',
  'ui.bootstrap',
  'ngSanitize',
  'Module.microsoft.controllers',
  'Module.microsoft.services',
]).config(['$stateProvider', function ($stateProvider) {
  $stateProvider.state('app.microsoft.office', {
    abstract: true,
    template: '<div ui-view></div>',
    translations: ['.']
  });

  $stateProvider.state('app.microsoft.office.product', {
    url: '/configuration/microsoft/office/license/:serviceName?tab',
    templateUrl: 'microsoft/office/license/microsoft-office-license.html',
    controller: 'MicrosoftOfficeLicenseCtrl',
    controllerAs: 'MicrosoftOfficeLicenseCtrl',
    reloadOnSearch: false,
    params: {
      tab: null,
    },
    resolve: {
      navigationInformations: ['Navigator', '$rootScope', function (Navigator, $rootScope) {
        _.set($rootScope, 'currentSectionInformation', 'microsoft');
        return Navigator.setNavigationInformation({
          leftMenuVisible: true,
          configurationSelected: true,
        });
      }],
    }
  });
}])
  .constant('MICROSOFT_GUIDE_URLS', {});
