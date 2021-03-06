package com.epam.eighty.service.impl;

import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.epam.eighty.domain.Topic;
import com.epam.eighty.repository.TopicRepository;
import com.epam.eighty.service.TopicService;

/**
 * @author Aliaksandr_Padalka
 */
@Service
@Transactional
public class TopicServiceImpl implements TopicService {

    @Autowired
    private TopicRepository topicRepo;

    @Autowired
    private Neo4jOperations template;

    @Override
    public Optional<Topic> getRoot() {
        Optional<Topic> root = topicRepo.findBySchemaPropertyValue("title", "root");
        root.ifPresent(someRoot ->
            someRoot.getTopics().forEach(template::fetch)
        );
        return root;
    }

    @Override
    public Optional <Topic> getTopicById(final Long id) {
        Optional<Topic> topic = topicRepo.findOne(id);
        topic.ifPresent(t ->
            t.getTopics().forEach(template::fetch)
        );
        return topic;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Set<Topic> getAllTopics() {
        return topicRepo.findAll().as(Set.class);
    }

    @Override
    public void updateTopic(final Topic topic) {
        topicRepo.save(topic);
    }

    @Override
    public void deleteTopic(final Long id) {
        topicRepo.delete(id);
    }

    @Override
    public Topic createTopic(final Topic topic, final Long id) {
        Optional<Topic> parentTopic = topicRepo.findOne(id);
        parentTopic.ifPresent(t -> {
            t.getTopics().add(topic);
            topicRepo.save(t);
        });

        return topic;
    }

}
