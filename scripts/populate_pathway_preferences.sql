-- scripts/populate_pathway_preferences.sql

DO $$
DECLARE
    v_round_id TEXT;
    v_mit_id TEXT;
    v_it_id TEXT;
    v_count_l1 INTEGER;
BEGIN
    -- 1. Get the latest open pathway selection round
    SELECT round_id INTO v_round_id 
    FROM selection_rounds 
    WHERE type = 'PATHWAY' AND status = 'OPEN' 
    ORDER BY created_at DESC LIMIT 1;

    IF v_round_id IS NULL THEN
        RAISE EXCEPTION 'No open pathway selection round found';
    END IF;

    -- 2. Get the program IDs (MIT and IT)
    -- MIT: B.Sc. in Management & Information Technology
    -- IT: B.Sc. in Information Technology
    SELECT program_id INTO v_mit_id 
    FROM "DegreeProgram" 
    WHERE name ILIKE '%Management & Information Technology%' 
    AND program_id IN (SELECT program_id FROM selection_round_configs WHERE round_id = v_round_id)
    LIMIT 1;

    SELECT program_id INTO v_it_id 
    FROM "DegreeProgram" 
    WHERE name ILIKE '%Information Technology%' 
    AND name NOT ILIKE '%Management%'
    AND program_id IN (SELECT program_id FROM selection_round_configs WHERE round_id = v_round_id)
    LIMIT 1;

    IF v_mit_id IS NULL OR v_it_id IS NULL THEN
        RAISE EXCEPTION 'Could not identify MIT and IT programs in the round configs';
    END IF;

    -- 3. Count eligible students
    SELECT COUNT(*) INTO v_count_l1 FROM "Student" WHERE current_level = 'L1';
    
    RAISE NOTICE 'Found Round: %', v_round_id;
    RAISE NOTICE 'MIT ID: %, IT ID: %', v_mit_id, v_it_id;
    RAISE NOTICE 'Processing % L1 students...', v_count_l1;

    -- 4. Insert/Update Selection Applications
    WITH eligible_students AS (
        SELECT student_id, current_gpa FROM "Student" WHERE current_level = 'L1'
    ),
    shuffled_students AS (
        SELECT student_id, current_gpa, row_number() OVER (ORDER BY random()) as rn, COUNT(*) OVER () as total_count
        FROM eligible_students
    )
    INSERT INTO selection_applications (app_id, round_id, student_id, preference_1, preference_2, status, gpa_at_time, applied_at, updated_at)
    SELECT 
        gen_random_uuid(),
        v_round_id,
        s.student_id,
        CASE WHEN s.rn <= s.total_count * 0.65 THEN v_mit_id ELSE v_it_id END,
        CASE WHEN s.rn <= s.total_count * 0.65 THEN v_it_id ELSE v_mit_id END,
        'PENDING',
        s.current_gpa,
        now(),
        now()
    FROM shuffled_students s
    ON CONFLICT (round_id, student_id) DO UPDATE SET
        preference_1 = EXCLUDED.preference_1,
        preference_2 = EXCLUDED.preference_2,
        gpa_at_time = EXCLUDED.gpa_at_time,
        updated_at = now();

    -- 5. Update Student table fields for consistency
    UPDATE "Student" s
    SET 
        pathway_preference_1_id = sa.preference_1,
        pathway_preference_2_id = sa.preference_2,
        pathway_selection_date = sa.applied_at
    FROM selection_applications sa
    WHERE s.student_id = sa.student_id 
    AND sa.round_id = v_round_id;

    RAISE NOTICE 'Successfully allocated preferences.';

END $$;
