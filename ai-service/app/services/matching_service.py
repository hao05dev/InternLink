from app.schemas.matching import RankJobsRequest, RankJobsResponse
from app.services.ranking_service import RankingService


class MatchingService:
    def __init__(self, ranking: RankingService):
        self.ranking = ranking

    def rank_jobs(self, request: RankJobsRequest) -> RankJobsResponse:
        # Embeddings are prepared separately. Ranking never makes N cloud calls.
        results = [self.ranking.rank_job_for_student(request.student, job) for job in request.jobs]
        results.sort(key=lambda item: (not item.score_available, -item.final_score, item.job_id))
        return RankJobsResponse(total_ranked=len(results), rankings=results)
