export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const resumeText = body.text;

    if (!resumeText) {
      return new Response(JSON.stringify({ error: "No resume text provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured in environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `You are an expert Korean HR consultant and professional translator. Extract, translate, and structure the given English resume text into a strict JSON format matching standard Korean job application forms (Iryeokseo / 자기소개서). 
    Return ONLY valid JSON with this exact structure:
    {
      "firstname": "",
      "lastname": "",
      "designation": "Nationality or Job Title in Korean/English",
      "address": "Korean or English address",
      "email": "",
      "phoneno": "",
      "summary": "YYYY년 MM월 일생 (DOB / Age summary)",
      "education": [
        { "edu_school": "", "edu_degree": "", "edu_city": "", "edu_start_date": "YYYY-MM-DD", "edu_graduation_date": "YYYY-MM-DD", "edu_description": "" }
      ],
      "experience": [
        { "exp_title": "", "exp_organization": "", "exp_location": "", "exp_start_date": "YYYY-MM-DD", "exp_end_date": "YYYY-MM-DD", "exp_description": "" }
      ],
      "achievements": [
        { "achieve_title": "", "achieve_description": "" }
      ],
      "skills": [
        { "skill": "" }
      ]
    }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: resumeText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    const data = await response.json();
    const parsedContent = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(parsedContent), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
