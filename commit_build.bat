rem test: yes (jUnit tests for java and javascript, integration tests)
rem code quality checks: yes (findbugs, pmd, checkstyle)
rem deploy: no deploy
rem intent of using: production
rem minification: yes
rem we can modify server port for protractor e2e tests by passing argument "-Dprotractor.port=_port_number_"
rem this can be useful to suppress port conflict during executing 2 synchronous Jenkins jobs
mvn clean verify -Pprod %1
