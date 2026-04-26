package com.freelance.service;

import com.freelance.entity.Project;
import com.freelance.entity.User;
import com.freelance.repository.ProjectRepository;
import com.freelance.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    @Transactional
    public Project createProject(Project project) {
        Long clientId = project.getClient() != null ? project.getClient().getId() : null;
        if (clientId == null) {
            throw new RuntimeException("Project must have a valid client id");
        }

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        if (client.getRole() != User.Role.CLIENT) {
            throw new RuntimeException("Only users with CLIENT role can own projects");
        }

        project.setClient(client);

        if (project.getStatus() == null) {
            project.setStatus(Project.Status.OPEN);
        }

        return projectRepository.save(project);
    }

    @Transactional
    public Project saveProject(Project project) {
        return createProject(project);
    }

    @Transactional
    public Project updateProject(Long id, Project updatedProject) {
        Project existingProject = getProjectById(id);

        existingProject.setTitle(updatedProject.getTitle());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setBudget(updatedProject.getBudget());
        existingProject.setStatus(updatedProject.getStatus());

        if (updatedProject.getClient() != null && updatedProject.getClient().getId() != null) {
            Long clientId = updatedProject.getClient().getId();
            User client = userRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

            if (client.getRole() != User.Role.CLIENT) {
                throw new RuntimeException("Only users with CLIENT role can own projects");
            }
            existingProject.setClient(client);
        }

        return projectRepository.save(existingProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
}
