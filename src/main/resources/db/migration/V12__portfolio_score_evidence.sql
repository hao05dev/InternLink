ALTER TABLE assessment_component_scores ADD COLUMN portfolio_revision_id UUID REFERENCES portfolio_revisions(id);
