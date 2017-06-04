/**
 * Created by amit on 03/06/17.
 */
var vokal = angular.module('vokal', ['ngMaterial', 'ui.router', 'angular-jwt', 'ngFileUpload']);

vokal.config(function Config($stateProvider, $urlRouterProvider, $locationProvider, jwtInterceptorProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    jwtInterceptorProvider.tokenGetter = ['config', function (config) {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            return user.token;
        } else {
            return null;
        }
    }];
    $httpProvider.interceptors.push('jwtInterceptor');
    $stateProvider
        .state('auth', {
            url: '/',
            templateUrl: '/auth.html',
            controller: 'authController',
            requireLogin: false
        })
        .state('dashboard', {
            url: '/app/dashboard',
            templateUrl: '/dashboard.html',
            controller: 'dashboardController',
            requireLogin: true
        })
        .state('search', {
            url: '/app/search',
            templateUrl: '/searchDetails.html',
            controller: 'dashboardController',
            requireLogin: true
        })
});

vokal.service('SessionService', function ($rootScope) {
    var user = localStorage.getItem('user');

    this.getUser = function () {
        return JSON.parse(localStorage.getItem('user'));
    };

    this.setUser = function (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
        this.broadcastLogin();
    };

    this.updateUser = function (user) {
        localStorage.setItem('user', JSON.stringify(user));
    };

    this.removeUser = function () {
        localStorage.clear();
        this.broadcastLogout();
    };

    this.broadcastLogout = function () {
        $rootScope.$broadcast('logout');
    };

    this.broadcastLogin = function () {
        $rootScope.$broadcast('loginSuccess');
    };

    this.isLoggedIn = function () {
        user = this.getUser();
        return user && user.hasOwnProperty('token');
    };

});

vokal.run(function ($rootScope, SessionService, $state, $mdToast) {
    var theme = localStorage.getItem('theme');

    $rootScope.theme = theme ? theme : 'theme-indigo';
    $rootScope.$state = $state;

    $rootScope.$on('$stateChangeStart', function (event, next) {
        if (!SessionService.isLoggedIn() && next.hasOwnProperty('requireLogin') && next.requireLogin) {
            event.preventDefault();
            $state.go('auth');
        } else if (SessionService.isLoggedIn() && next.name == 'auth') {
            event.preventDefault();
            $state.go('dashboard');
        }
    });

    $rootScope.$on('toast', function (event, title) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(title)
                .position('top right')
                .hideDelay(3000)
        );
    })
});

vokal.controller('navController', ['$scope', '$rootScope', '$state', 'SessionService',
    function ($scope, $rootScope, $state, SessionService) {

        $rootScope.$on('loginSuccess', function () {
            $scope.isLoggedIn = true;
        });

        $rootScope.$on('logout', function () {
            $scope.isLoggedIn = false;
        });

        if (SessionService.isLoggedIn()) {
            SessionService.broadcastLogin();
        }

        $scope.themes = [
            {name: 'Indigo', class: 'theme-indigo'},
            {name: 'Green', class: 'theme-green'},
            {name: 'Cyan', class: 'theme-cyan'},
            {name: 'Deep Purple', class: 'theme-deep-purple'}
        ];

        $scope.setTheme = function (theme) {
            $rootScope.theme = theme.class;
            localStorage.setItem('theme', theme.class);
        };

        $scope.logout = function () {
            SessionService.removeUser();
            $state.go('auth');
        };

        $scope.goTo = function (state) {
            $state.go(state);
        }
    }
]);

vokal.controller('authController', ['$scope', '$rootScope', '$state', 'authApi', 'SessionService',
    function ($scope, $rootScope, $state, authApi, SessionService) {
        $scope.user = {};
        $scope.authState = 'login';

        $scope.setAuthState = function (state) {
            $scope.authState = state;
        };

        $scope.submit = function () {
            if ($scope.authState === 'login') {
                login();
            } else {
                signUp();
            }
        };

        var signUp = function () {
            authApi.signUp($scope.user).then(function (result) {
                var data = result.data;
                if (data.hasOwnProperty('message')) {
                    $rootScope.$broadcast('toast', 'Email already exists');
                } else if (data && data.hasOwnProperty('token')) {
                    SessionService.setUser(data);
                    $state.go('dashboard');
                }
            }, function (error) {

            })
        };

        var login = function () {
            authApi.login($scope.user).then(function (result) {
                var data = result.data;
                if (data.hasOwnProperty('message')) {
                    if (data.message === 'wrongPassword') {
                        $rootScope.$broadcast('toast', 'Wrong Password');
                    } else {
                        $rootScope.$broadcast('toast', 'No user found with this email');
                    }
                } else if (data && data.length > 0 && data[0].hasOwnProperty('token')) {
                    SessionService.setUser(data[0]);
                    $state.go('dashboard');
                }
            }, function (error) {

            })
        };
    }]);

vokal.directive('googleplace', ['$rootScope', function($rootScope) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var autocomplete = new google.maps.places.Autocomplete(element[0]);
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                scope.$apply(function() {
                    model.$setViewValue(element.val());
                });
                var place = autocomplete.getPlace();
                $rootScope.$broadcast('placeDetail', place);
            });
        }
    };
}]);

vokal.controller('dashboardController', ['$scope', '$rootScope', 'searchApi',
    function ($scope, $rootScope, searchApi) {

        $scope.$on('placeDetail', function(event, place) {
            $scope.place = formattedSearch(place);
            createSearch();
        });

        function formattedSearch(place) {
            return {
                name: place.name || '',
                address: place.formatted_address || '',
                phoneNumber: place.formatted_phone_number || '',
                location : {
                    lat: place.geometry ? place.geometry.location.lat() : '',
                    lng: place.geometry ? place.geometry.location.lng() : ''
                },
                viewPort: {
                    northeast: {
                        lat: place.geometry ? place.geometry.viewport.b.b : '',
                        lng: place.geometry ? place.geometry.viewport.b.f : ''
                    },
                    southwest: {
                        lat: place.geometry ? place.geometry.viewport.f.b : '',
                        lng: place.geometry ? place.geometry.viewport.f.f : ''
                    }
                },
                reviews: place.reviews || [],
                sId: place.id || '',
                rating: place.rating || 0,
                icon: place.icon || ''
            }
        }

        $scope.setFieldType = function (index, type) {
            if (type === null && $scope.space.fields[index].hasOwnProperty('done')) {
                delete $scope.space.fields[index];
                var position;
                for (var i in $scope.fields) {
                    if ($scope.fields[i] === index) {
                        position = i;
                        break;
                    }
                }
                if (position) {
                    $scope.fields.splice(position, 1);
                }
                return;
            }
            if ($scope.space.fields && $scope.space.fields.hasOwnProperty(index) && $scope.space.fields[index].name) {
                $scope.space.fields[index].type = type;
                if (type === null && $scope.space.fields[index].hasOwnProperty('done')) {
                    delete $scope.space.fields[index].done;
                }
            } else {
                $rootScope.$broadcast('toast', 'Add field name to confirm');
            }
        };

        $scope.addFieldType = function (index) {
            if ($scope.space.fields && $scope.space.fields[index].name) {
                $scope.space.fields[index].done = true;
                $scope.fields.push(index + 1);
            } else {
                $rootScope.$broadcast('toast', 'Add field name to confirm');
            }
        };

        $scope.getBtnStatus = function () {
            if (!$scope.space.fields) {
                return true;
            } else if (!Object.keys($scope.space.fields).length) {
                return true;
            }
            var isDisabled = false;
            for (var i in $scope.space.fields) {
                var field = $scope.space.fields[i];
                if (field && field.hasOwnProperty('name') && field.name === '') {
                    continue;
                } else if ((field && !field.hasOwnProperty('name') && field.name !== '')
                    || (!field.hasOwnProperty('type')) || (!field.type || !field.name)) {
                    isDisabled = true;
                    break;
                }
            }
            return isDisabled;
        };

        var createSearch = function () {
            searchApi.create($scope.place).then(function (result) {
                if (result && result.hasOwnProperty('data')) {
                    $scope.searchData = result.data;
                }
            }, function (error) {

            })
        };

        var getSearchDetail = function (status) {
            searchApi.get().then(function (result) {
                if (result && result.hasOwnProperty('data') && result.data) {
                    $scope.searchDetails = result.data;
                }
            }, function (error) {
                console.log(error);
            })
        };

        getSearchDetail();

    }]);

vokal.service('authApi', ['$http', function ($http) {

    this.login = function (params) {
        if (!params)
            params = {};
        return $http.post('/auth/login', params).then(function successCallback(response) {
            return response;
        }, function errorCallback() {
        });
    };

    this.signUp = function (params) {
        if (!params)
            params = {};
        return $http.post('/auth/signup', params).then(function successCallback(response) {
            return response;
        }, function errorCallback() {
        });
    };

}]);

vokal.service('searchApi', ['$http', function ($http) {

    var BASE_URL = '/api/v1/search';

    this.create = function (params) {
        if (!params)
            params = {};
        return $http.post(BASE_URL, params).then(function successCallback(response) {
            return response;
        }, function errorCallback() {

        });
    };

    this.get = function (params) {
        if (!params)
            params = {};
        return $http.get(BASE_URL, {params: params}).then(function successCallback(response) {
            return response;
        }, function errorCallback() {

        });
    };

}]);