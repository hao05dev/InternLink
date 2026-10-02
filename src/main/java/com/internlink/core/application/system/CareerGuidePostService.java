package com.internlink.core.application.system;

import com.internlink.core.presentation.system.dto.request.CreatePostRequest;
import com.internlink.core.presentation.system.dto.request.UpdatePostRequest;
import com.internlink.core.presentation.system.dto.response.PostResponse;
import com.internlink.core.shared.enums.PostCategory;

import java.util.List;
import java.util.UUID;

public interface CareerGuidePostService {

    List<PostResponse> getPublishedPosts(PostCategory category, String search);

    PostResponse getPublishedPostBySlug(String slug);

    List<PostResponse> getAllPostsForManagement(PostCategory category, String status, String search);

    PostResponse getPostById(UUID id);

    PostResponse createPost(UUID authorUserId, CreatePostRequest request);

    PostResponse updatePost(UUID id, UpdatePostRequest request);

    void deletePost(UUID id);

    PostResponse togglePinPost(UUID id);

    PostResponse updatePostStatus(UUID id, String status);
}
