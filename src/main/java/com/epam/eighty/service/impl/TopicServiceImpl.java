package com.epam.eighty.service.impl;

import com.epam.eighty.domain.Topic;
import com.epam.eighty.repository.TopicRepository;
import com.epam.eighty.service.TopicService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

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
    public Optional <Topic> getFullTopicById(final Long id) {
        Optional<Topic> topic = topicRepo.findOne(id);
        topic.ifPresent(t -> {
            t.getTopics().forEach(template::fetch);
            t.getQuestions().forEach(template::fetch);
        });
        return topic;
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

    @Override
    public Long getIdOfLastNotDeletedTopic(List<Long> topicIds) {
        for(Long id: topicIds) {
            Optional<Topic> topic = topicRepo.findOne(id);
            if(topic.isPresent()) {
                return id;
            }
        }
        return null;
    }

    @Override
    public Optional<Topic> getTopicWithChildsTillTopicWithId(Long id) {
        Optional<Topic> root = topicRepo.findBySchemaPropertyValue("title", "root");
        List<Topic> path = topicRepo.getRootTopicsForTopic(id).getContent();
        root.ifPresent(r -> {
            topicsFetchIfNeeded(r, path);
        });
        return root;
    }

    private void topicsFetchIfNeeded(Topic topic, List<Topic> path) {
        topic.getTopics().forEach(t -> {
            template.fetch(t);
            if(path.contains(t)) {
                topicsFetchIfNeeded(t, path);
            }
        });
    }
}
