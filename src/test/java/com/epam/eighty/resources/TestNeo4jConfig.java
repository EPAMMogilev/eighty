package com.epam.eighty.resources;

import org.junit.Ignore;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.test.TestGraphDatabaseFactory;
import org.springframework.context.annotation.AdviceMode;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.config.EnableNeo4jRepositories;
import org.springframework.data.neo4j.config.Neo4jConfiguration;
import org.springframework.data.neo4j.support.DelegatingGraphDatabase;
import org.springframework.data.neo4j.support.Neo4jTemplate;
import org.springframework.data.neo4j.support.typerepresentation.TypeRepresentationStrategyFactory;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Created by Aliaksandr_Padalka on 18/06/2014.
 */
@Configuration
@EnableNeo4jRepositories("com.epam.eighty.repository")
@EnableTransactionManagement(mode = AdviceMode.PROXY)
@Ignore
public class TestNeo4jConfig extends Neo4jConfiguration {

    public TestNeo4jConfig() {
        setBasePackage("com.epam.eighty.domain");
    }

    @Bean(destroyMethod = "shutdown")
    public GraphDatabaseService graphDatabaseService() {
        return new TestGraphDatabaseFactory().newImpermanentDatabase();
    }

    @Bean
    public Neo4jTemplate neo4jBean() {
        return new Neo4jTemplate(graphDatabaseService());
    }

    @Bean
    public DelegatingGraphDatabase delegatingGraphDatabase(GraphDatabaseService graphDatabaseService) {
        return new DelegatingGraphDatabase(graphDatabaseService);
    }

    @Bean
    public TypeRepresentationStrategyFactory typeRepresentationStrategyFactory(DelegatingGraphDatabase delegatingGraphDatabase) {
        return new TypeRepresentationStrategyFactory(delegatingGraphDatabase, TypeRepresentationStrategyFactory.Strategy.Labeled);
    }
}
