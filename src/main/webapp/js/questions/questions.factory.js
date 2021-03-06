/**
 * @ngdoc service
 * @name eightyQuestionsFactory.questionsFactory
 *
 * @description
 * A factory which shares question methods between controllers.
 */
(function () {
    'use strict';
    /*exported isPrintLog */
    angular
        .module('eightyFactories')
        .factory('questionsFactory', questionsFactory);

        questionsFactory.$inject = ['$modal', '$stateParams', '$rootScope', 'crudFactory', 'modalData', 'utility'];

        function questionsFactory($modal, $stateParams, $rootScope, crudFactory, modalData, utility) {

            var publicMethods = {
                checkCollapsed: checkCollapsed,
                checkInSet: checkInSet,
                rateUp: rateUp,
                editQuestion: editQuestion,
                exportQuestion: exportQuestion,
                clearFilter: clearFilter,
                loadCustomersByName: loadCustomersByName,
                loadTagsByName: loadTagsByName,
                getExport: getExportSet,
                getLength: getExportSetLength,
                addQuestion: addQuestion,
                loadQuestions: loadQuestions,
                loadTagsAndCustomersByTopic: loadTagsAndCustomersByTopic,
                getTopic: getTopic,
                saveQuestionChanges: saveQuestionChanges,
                deleteQuestion: deleteQuestion
            };
            return publicMethods;

            function checkCollapsed(expand, q) {
                if (!containsInSet(expand, q)) {
                    expand.push(q);
                } else {
                    expand.splice(getIndex(expand, q), 1);
                }
                return expand;
            }
            function checkInSet(key, obj) {
                return utility.containsInSet(key, obj);
            }
            function rateUp(questionUI) {
                if (questionUI.like === null) {
                    questionUI.like = 0;
                }
                crudFactory.question().get({id: questionUI.id}).$promise.then(function (question) {
                    question.like++;
                    questionUI.like++;
                    crudFactory.question().update(question).$promise.then(undefined, function(error) {
                        printLog(error);
                    });
                    utility.saveInSet('ratedSet', question);
                    if (utility.containsInSet('exportSet', question)) {
                        utility.updateInSet('exportSet', question);
                    }
                }, function(error) {
                    printLog(error);
                });
            }
            function editQuestion(question, vm) {
                modalData.setShouldBeOpen(true);

                $modal.open({
                    templateUrl: 'pages/editquestion.html',
                    controller: 'editQuestionInstanceCtrl as editQuestion',
                    resolve: {
                        question: getQuestion,
                        questionsCtrl: getQuestionsCtrl
                    }
                });

                function getQuestion() {
                    return question;
                }

                function getQuestionsCtrl() {
                    return vm;
                }
            }
            function exportQuestion(q, vm) {
                if (!utility.containsInSet('exportSet', q)) {
                    utility.saveInSet('exportSet', q);
                } else {
                    utility.removeFromSet('exportSet', q);
                }
                vm.questionsForExport = getExportSet();
            }
            function clearFilter(vm) {
                vm.criteria = '';
            }
            function loadCustomersByName(query) {
                var customers = crudFactory.customers().getSortedSetOfCustomersByName({customerName: query}).$promise;
                customers.then(undefined, function (error) {
                    printLog(error);
                });
                return customers;
            }
            function loadTagsByName(query) {
                var tags = crudFactory.tags().getSortedSetOfTagsByName({tagName: query}).$promise;
                tags.then(undefined, function (error) {
                    printLog(error);
                });
                return tags;
            }
            function getExportSet() {
                return utility.getSet('exportSet');
            }
            function getExportSetLength() {
                return utility.getLength('exportSet');
            }
            function addQuestion(vm) {
                modalData.setShouldBeOpen(true);
                var modalInstance = $modal.open({
                    templateUrl: 'pages/addquestion.html',
                    controller: 'addQuestionInstanceCtrl as addQuestion'
                });

                modalInstance.result.then(function (question) {
                    if (vm.selectedTags) {
                        vm.clearTags();
                    }
                    crudFactory.question().create({id: $stateParams.id}, question).$promise.then(function (q) {
                        vm.questions.push(q);
                        $rootScope.$broadcast('topicTags-update');
                        $rootScope.$broadcast('topTags-update');
                    }, function(error) {
                        printLog(error);
                    });
                });
            }
            function loadQuestions(scope, page) {
                if ($stateParams.id) {
                    crudFactory.questions().allQuestions({id: $stateParams.id, page: page, size: scrollAddOption.count, sort: scrollAddOption.sort})
                        .$promise.then(function (set) {
                            if ((page === 0) && (set.length === 0)) {
                                page = -1;
                                scope.message = 'No questions';
                                scope.exportLen = publicMethods.getLength();
                                return;
                            }
                            scope.loading = false;
                            scope.isCollapsed = false;
                            scope.questions = scope.questions.concat(set);
                            if (set.length < scrollAddOption.count) {
                                page = -1;
                            }
                            scope.exportLen = publicMethods.getLength();
                        }, function(error) {
                            printLog(error);
                        });
                }
            }
            function loadTagsAndCustomersByTopic(scope) {
                var tempTagsAndCustomers = [];
                crudFactory.tags().tagsByTopicId({id: $stateParams.id}).$promise.then(function(tags) {
                    for(var i = 0; i < tags.length; i++){
                        tempTagsAndCustomers.push(tags[i]);
                    }
                }, function(error) {
                    printLog(error);
                });
                crudFactory.customers().getCustomersByTopicId({id: $stateParams.id}).$promise.then(function (customers) {
                    for(var i = 0; i < customers.length; i++){
                        tempTagsAndCustomers.push(customers[i]);
                    }
                }, function(error) {
                    printLog(error);
                });
                scope.tagsAndCustomers = tempTagsAndCustomers;
            }
            function getTopic() {
              var topic = crudFactory.topic().get({id: $stateParams.id});
                topic.$promise.then(undefined, function(error) {
                    printLog(error);
                });
                return topic;
            }
            function saveQuestionChanges(vm, question) {
                modalData.setShouldBeOpen(false);
                question.question = vm.question.question;
                question.answer = vm.question.answer;
                question.tags = vm.question.tags;
                question.customers = vm.question.customers;
                if (question.question) {
                    crudFactory.question().update(question).$promise.then(function () {
                        if (utility.containsInSet('exportSet', question)) {
                            utility.updateInSet('exportSet', question);
                        }
                        $rootScope.$broadcast('topTags-update');
                        $rootScope.$broadcast('topicTags-update');
                        if (vm.questionsForExport) {
                            vm.questionsForExport[getIndex(vm.questionsForExport, question)] = question;
                        }
                    }, function(error) {
                        printLog(error);
                    });
                    if (vm.selectedTags) {
                        vm.clearTags();
                    }
                }
            }
            function deleteQuestion(vm, question) {
                modalData.setShouldBeOpen(false);
                var modalInstance = $modal.open({
                    templateUrl: 'pages/deletequestion.html',
                    controller: 'deleteQuestionInstanceCtrl as deleteQuestion',
                    backdrop: 'static'
                });

                modalInstance.result.then(function () {
                    crudFactory.question().remove(question).$promise.then(function ()
                    {
                        vm.questions.splice(getIndex(vm.questions, question), 1);

                        if (utility.containsInSet('exportSet', question)) {
                            utility.removeFromSet('exportSet', question);
                        }
                        $rootScope.$broadcast('topTags-update');
                        $rootScope.$broadcast('topicTags-update');
                        if (vm.questionsForExport) {
                            vm.questionsForExport.splice(getIndex(vm.questionsForExport, question), 1);
                        }
                        if (vm.selectedTags) {
                            vm.clearTags();
                        }
                    }, function(error) {
                        printLog(error);
                    });

                });
            }
        }
})();