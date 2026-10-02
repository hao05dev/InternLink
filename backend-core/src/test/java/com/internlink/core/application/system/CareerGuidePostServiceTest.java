package com.internlink.core.application.system;

import com.internlink.core.application.system.impl.CareerGuidePostMapper;
import com.internlink.core.application.system.impl.CareerGuidePostServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.system.CareerGuidePost;
import com.internlink.core.infrastructure.persistence.jpa.JpaCareerGuidePostRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.system.dto.request.CreatePostRequest;
import com.internlink.core.presentation.system.dto.request.UpdatePostRequest;
import com.internlink.core.presentation.system.dto.response.PostResponse;
import com.internlink.core.shared.enums.PostCategory;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CareerGuidePostServiceTest {

    @Mock
    private JpaCareerGuidePostRepository postRepository;

    @Mock
    private JpaUserRepository userRepository;

    @Spy
    private CareerGuidePostMapper postMapper = new CareerGuidePostMapper();

    @InjectMocks
    private CareerGuidePostServiceImpl postService;

    private User author;
    private Department department;
    private CareerGuidePost post;
    private UUID postId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        postId = UUID.randomUUID();

        department = Department.builder()
            .name("Khoa Công nghệ Thông tin & Truyền thông")
            .code("CICT")
            .build();

        author = User.builder()
            .email("bcn.cntt@ctu.edu.vn")
            .fullName("Ban Chủ nhiệm Khoa CNTT & TT")
            .role(UserRole.FACULTY_ADMIN)
            .department(department)
            .build();

        post = CareerGuidePost.builder()
            .department(department)
            .author(author)
            .title("Thông báo Ngày hội Việc làm CICT Job Fair 2026")
            .slug("thong-bao-ngay-hoi-viec-lam-cict-job-fair-2026")
            .category(PostCategory.JOB_FAIR)
            .summary("Ngày hội việc làm kết nối hơn 40 doanh nghiệp CNTT.")
            .content("Nội dung chi tiết về ngày hội...")
            .coverImageUrl("https://images.unsplash.com/photo-1")
            .tags(List.of("JobFair", "CICT"))
            .isPinned(true)
            .visibility("PUBLIC")
            .status("PUBLISHED")
            .viewCount(100)
            .build();
    }

    @Test
    @DisplayName("getPublishedPosts - should return mapped post responses via Specification")
    void getPublishedPosts_success() {
        when(postRepository.findAll(any(Specification.class), any(Sort.class)))
            .thenReturn(List.of(post));

        List<PostResponse> results = postService.getPublishedPosts(PostCategory.JOB_FAIR, "Job Fair");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo(post.getTitle());
        assertThat(results.get(0).getCategory()).isEqualTo(PostCategory.JOB_FAIR);
    }

    @Test
    @DisplayName("getPublishedPostBySlug - should increment view count and return response")
    void getPublishedPostBySlug_success() {
        when(postRepository.findBySlug(post.getSlug())).thenReturn(Optional.of(post));

        PostResponse response = postService.getPublishedPostBySlug(post.getSlug());

        assertThat(response).isNotNull();
        assertThat(response.getSlug()).isEqualTo(post.getSlug());
        verify(postRepository, times(1)).incrementViewCount(post.getId());
    }

    @Test
    @DisplayName("getPublishedPostBySlug - not found throws ResourceNotFoundException")
    void getPublishedPostBySlug_notFound() {
        when(postRepository.findBySlug("unknown-slug")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPublishedPostBySlug("unknown-slug"))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createPost - should create and save post with generated slug")
    void createPost_success() {
        CreatePostRequest request = CreatePostRequest.builder()
            .title("Hướng dẫn hoàn thiện Mẫu M01 Thực tập")
            .category(PostCategory.REGULATIONS_GUIDELINES)
            .summary("Quy định nộp mẫu M01")
            .content("Các bước thực hiện chi tiết...")
            .isPinned(false)
            .status("PUBLISHED")
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(author));
        when(postRepository.existsBySlug(any())).thenReturn(false);
        when(postRepository.save(any(CareerGuidePost.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostResponse response = postService.createPost(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Hướng dẫn hoàn thiện Mẫu M01 Thực tập");
        assertThat(response.getSlug()).isEqualTo("huong-dan-hoan-thien-mau-m01-thuc-tap");
        assertThat(response.getStatus()).isEqualTo("PUBLISHED");
    }

    @Test
    @DisplayName("togglePinPost - should toggle isPinned state")
    void togglePinPost_success() {
        post.setIsPinned(true);
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postRepository.save(any(CareerGuidePost.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostResponse response = postService.togglePinPost(postId);

        assertThat(response.getIsPinned()).isFalse();
    }

    @Test
    @DisplayName("deletePost - should delete post from repository")
    void deletePost_success() {
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        postService.deletePost(postId);

        verify(postRepository, times(1)).delete(post);
    }
}
