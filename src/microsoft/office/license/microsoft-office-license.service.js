angular.module("Module.microsoft.services").service("MicrosoftOfficeLicenseService", class MicrosoftOfficeLicenseService {

    constructor ($cacheFactory, $http, $q, $window, constants, OvhHttp, Poll, translator, User) {
        this.$cacheFactory = $cacheFactory;
        this.$http = $http;
        this.$q = $q;
        this.$window = $window;
        this.constants = constants;
        this.pollService = Poll;
        this.ovhHttp = OvhHttp;
        this.translator = translator;
        this.User = User;

        this.basePath = "apiv6/license/office";
    }

    /**
     * Get all service
     * @param  {string} licenseId
     * @return {[string]}
     */
    get (licenseId) {
        return this.$http.get(`${this.basePath}/${licenseId}`)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Edit the service
     * @param  {string} licenseId
     * @param  {Object} officeTenant
     * @return {[type]}
     */
    edit (licenseId, officeTenant) {
        return this.$http.put(`${this.basePath}/${licenseId}`, officeTenant)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Edit the password
     * @param  {string} licenseId       [description]
     * @param  {string} activationEmail [description]
     * @param  {Object} data            [description]
     * @return {Task}                 [description]
     */
    editPassword (licenseId, activationEmail, data) {
        return this.$http.post(`${this.basePath}/${licenseId}/user/${activationEmail}/changePassword`, data)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Get service's infos
     * @param  {string} licenseId [description]
     * @return {Service}           [description]
     */
    getServiceInfos (licenseId) {
        return this.ovhHttp.get("/license/office/{serviceName}/serviceInfos", {
            rootPath: "apiv6",
            urlParams: {
                serviceName: licenseId
            },
            cache: "office.license.serviceinfos"
        });
    }

    /**
     * Get array of user id
     * @param  {string} licenseId [description]
     * @return {[string]}           [description]
     */
    getUsers (licenseId) {
        return this.$http.get(`${this.basePath}/${licenseId}/user`)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Get licence model
     * @return {Object} [description]
     */
    getLicenses () {
        return this.$http.get(`${this.basePath}.json`)
            .then((response) => response.data.models["license.office.LicenceEnum"].enum)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Get infos of a user
     * @param  {string} licenseId [description]
     * @param  {string} userId    [description]
     * @return {Object}           [description]
     */
    getUserDetails (licenseId, userId) {
        return this.$http.get(`${this.basePath}/${licenseId}/user/${userId}`)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    pollUserDetails (licenseId, userId, $scope) {
        const namespace = "microsoft.office.licence.user.details";

        $scope.$on("$destroy", () => {
            this.pollService.kill({
                namespace
            });
        });

        return this.pollService.poll(`${this.basePath}/${licenseId}/user/${userId}`, null, {
            scope: $scope.$id,
            successRule: {
                status: "ok"
            },
            namespace
        });

    }

    /**
     * Add a user
     * @param {string} licenseId [description]
     * @param {Object} data      [description]
     * @return {Task}           [description]
     */
    addUser (licenseId, data) {
        return this.$http.post(`${this.basePath}/${licenseId}/user`, data)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err));
    }

    /**
     * Update a user
     * @param  {string} serviceName     [description]
     * @param  {string} activationEmail [description]
     * @param  {Object} data            [description]
     * @return {Task}                 [description]
     */
    updateUser (serviceName, activationEmail, data) {
        return this.$http.put(`${this.basePath}/${serviceName}/user/${activationEmail}`, data)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err));
    }

    /**
     * Delete a user
     * @param  {string} licenseId [description]
     * @param  {string} userId    [description]
     * @return {Task}           [description]
     */
    deleteUser (licenseId, userId) {
        return this.$http.delete(`${this.basePath}/${licenseId}/user/${userId}`)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Get array of domain id
     * @param  {string} licenseId [description]
     * @return {[string]}           [description]
     */
    getDomainsId (licenseId) {
        return this.$http.get(`${this.basePath}/${licenseId}/domain`)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
    * Get a domain
     * @param  {string} licenseId [description]
     * @param  {string} domain    [description]
     * @return {Object}           [description]
     */
    getDomain (licenseId, domain) {
        return this.$http.get(`${this.basePath}/${licenseId}/domain/${domain}`)
            .then((response) => response.data)
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Get statistic of a license
     * @param  {Object} opts [description]
     * @return {Object}      [description]
     */
    consumption (opts) {
        const dataByLicense = {};
        const stat = {
            options: {
                exporting: {
                    enabled: false
                }
            },
            series: [],
            title: {
                text: this.translator.tr("microsoft_office_license_usage_stats")
            },
            xAxis: {
                type: "datetime",
                min: moment(opts.from).format("x"),
                max: moment(opts.to).format("x")
            },
            yAxis: {
                min: 0,
                tickInterval: 1,
                title: {
                    text: this.translator.tr("microsoft_office_license_peakcount")
                }
            }
        };

        return this.$http.get(`${this.basePath}/${opts.serviceName}/usageStatistics`, {
            params: {
                from: opts.from,
                to: opts.to
            }
        })
            .then((response) => {
                const series = response.data;

                _.forEach(series.reverse(), (oneDay) => {

                    _.forEach(oneDay.lines, (line) => {

                        if (!dataByLicense[line.licenceType]) {
                            dataByLicense[line.licenceType] = [];
                        }

                        dataByLicense[line.licenceType].push([
                            new Date(oneDay.date).getTime(),
                            line.peakCount
                        ]);
                    });
                });

                stat.series = _.map(dataByLicense, (value, oneLicense) => ({
                    id: oneLicense,
                    name: this.translator.tr(`microsoft_office_license_${oneLicense}_serie_name`),
                    data: value
                }));

                return stat;
            })
            .catch((err) => this.$q.reject(err.data));
    }

    /**
     * Redirect to the express order page
     * @param {String} licenseType [the type of office license to buy]
     * @param {Number} number [the number of office licenses to buy]
    */
    gotToOrderPrepaidLicenses (licenseType, number) {
        const answer = {

        };

        this.User.getUrlOfEndsWithSubsidiary("express_order").then((expressOrderUrl) => {
            this.$window.open(`${expressOrderUrl}#/new/express/resume?products=${JSURL.stringify(answer)}`, "_blank");
        });
    }
});
