package com.epam.eighty.service;

import com.epam.eighty.domain.Topic;

import java.util.List;
import java.util.Set;

/**
 * @author Aliaksandr_Padalka
 */
public interface TopicService {

    Topic getRoot();
    Topic getTopicById(Long id);
    Set<Topic> getAllTopics();
    void updateTopic(Topic topic);
    void deleteTopic(Long id);
    Topic getFullTopicById(Long id);
    Topic createTopic(Topic topic, Long id);
    List<Topic> getRootTopicsForTopic(Long id);
}
