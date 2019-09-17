angular.module('Module.microsoft.controllers').controller('MicrosoftOfficeLicenseTabsCtrl', class MicrosoftOfficeLicenseTabsCtrl {
  constructor($location, $scope, $stateParams) {
    this.$location = $location;
    this.$scope = $scope;
    this.$stateParams = $stateParams;

    this.defaultTab = 'USER';
  }

  $onInit() {
    this.$scope.toKebabCase = _.kebabCase;
    this.$scope.tabs = ['USER', 'CONSUMPTION'];

    this.$scope.setSelectedTab = (tab) => {
      if (!_.isEmpty(tab)) {
        this.$scope.selectedTab = tab;
      } else {
        this.$scope.selectedTab = this.defaultTab;
      }
      this.$location.search('tab', this.$scope.selectedTab);
    };

    if (!_.isNull(this.$stateParams.tab)
      && _.some(this.$scope.tabs, (item) => item === angular.uppercase(this.$stateParams.tab))) {
      this.$scope.setSelectedTab(angular.uppercase(this.$stateParams.tab));
    } else {
      this.$scope.setSelectedTab(this.defaultTab);
    }
  }
});
