import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Create courses
  const courses = [
    {
      level: 'A1',
      title: 'Iniciante Completo',
      description: 'Fundamentos do inglês: alfabeto, saudações, verbos básicos, vocabulário essencial do dia a dia',
      order: 1,
      totalLessons: 20,
      estimatedHours: 15,
    },
    {
      level: 'A2',
      title: 'Básico',
      description: 'Tempos verbais presentes e passados, futuro simples, comparativos, conversação básica',
      order: 2,
      totalLessons: 25,
      estimatedHours: 20,
    },
    {
      level: 'B1',
      title: 'Intermediário',
      description: 'Present perfect, condicionais, phrasal verbs, expressões idiomáticas, textos mais longos',
      order: 3,
      totalLessons: 30,
      estimatedHours: 30,
    },
    {
      level: 'B2',
      title: 'Intermediário Avançado',
      description: 'Voz passiva, reported speech, nuances gramaticais, inglês acadêmico/profissional',
      order: 4,
      totalLessons: 25,
      estimatedHours: 35,
    },
    {
      level: 'C1',
      title: 'Avançado',
      description: 'Estruturas complexas, vocabulário sofisticado, fluência nativa, preparação para exames',
      order: 5,
      totalLessons: 20,
      estimatedHours: 40,
    },
    {
      level: 'C2',
      title: 'Proficiência',
      description: 'Domínio total: sotaques, gírias, linguagem técnica, certificação Cambridge/IELTS',
      order: 6,
      totalLessons: 15,
      estimatedHours: 50,
    },
  ]

  for (const course of courses) {
    await prisma.course.upsert({
      where: { level: course.level },
      update: course,
      create: course,
    })
  }

  console.log('✅ Cursos criados')

  // Create lessons for A1 course
  const a1Course = await prisma.course.findUnique({ where: { level: 'A1' } })
  if (a1Course) {
    const a1Lessons = [
      { order: 1, title: 'Lição 1: Alfabeto e Pronúncia', description: 'Aprenda o alfabeto inglês e os sons básicos', xpReward: 25, content: JSON.stringify(getLessonContent('alphabet')) },
      { order: 2, title: 'Lição 2: Saudações e Despedidas', description: 'Cumprimente e despeça-se em inglês', xpReward: 25, content: JSON.stringify(getLessonContent('greetings')) },
      { order: 3, title: 'Lição 3: Verbo To Be - Afirmativo', description: 'Eu sou, você é, ele é...', xpReward: 25, content: JSON.stringify(getLessonContent('tobe_affirmative')) },
      { order: 4, title: 'Lição 4: Verbo To Be - Negativo e Interrogativo', description: 'Não sou, sou eu?', xpReward: 25, content: JSON.stringify(getLessonContent('tobe_negative')) },
      { order: 5, title: 'Lição 5: Artigos A/An e The', description: 'Artigos definidos e indefinidos', xpReward: 25, content: JSON.stringify(getLessonContent('articles')) },
      { order: 6, title: 'Lição 6: Substantivos no Plural', description: 'Regras de plural regulares e irregulares', xpReward: 25, content: JSON.stringify(getLessonContent('plurals')) },
      { order: 7, title: 'Lição 7: Pronomes Pessoais', description: 'I, you, he, she, it, we, they', xpReward: 25, content: JSON.stringify(getLessonContent('pronouns')) },
      { order: 8, title: 'Lição 8: Verbo To Have', description: 'Ter, possuir, auxiliar', xpReward: 25, content: JSON.stringify(getLessonContent('tohave')) },
      { order: 9, title: 'Lição 9: Números 1-20', description: 'Contando em inglês', xpReward: 25, content: JSON.stringify(getLessonContent('numbers')) },
      { order: 10, title: 'Lição 10: Cores', description: 'Red, blue, green...', xpReward: 25, content: JSON.stringify(getLessonContent('colors')) },
      { order: 11, title: 'Lição 11: Dias da Semana e Meses', description: 'Calendar vocabulary', xpReward: 25, content: JSON.stringify(getLessonContent('calendar')) },
      { order: 12, title: 'Lição 12: Família e Relacionamentos', description: 'Mother, father, sister, brother...', xpReward: 25, content: JSON.stringify(getLessonContent('family')) },
      { order: 13, title: 'Lição 13: Adjetivos Básicos', description: 'Big, small, good, bad...', xpReward: 25, content: JSON.stringify(getLessonContent('adjectives')) },
      { order: 14, title: 'Lição 14: Preposições de Lugar', description: 'In, on, at, under, next to', xpReward: 25, content: JSON.stringify(getLessonContent('prepositions')) },
      { order: 15, title: 'Lição 15: Presente Simples - Verbos Regulares', description: 'I work, you work, he works', xpReward: 25, content: JSON.stringify(getLessonContent('present_simple')) },
      { order: 16, title: 'Lição 16: Presente Simples - Negativo/Interrogativo', description: 'Do you work? I don\'t work', xpReward: 25, content: JSON.stringify(getLessonContent('present_simple_neg')) },
      { order: 17, title: 'Lição 17: Rotina Diária', description: 'Wake up, brush teeth, have breakfast', xpReward: 25, content: JSON.stringify(getLessonContent('routine')) },
      { order: 18, title: 'Lição 18: Comida e Bebida', description: 'Food, water, apple, bread...', xpReward: 25, content: JSON.stringify(getLessonContent('food')) },
      { order: 19, title: 'Lição 19: Roupas e Acessórios', description: 'Shirt, pants, shoes, hat...', xpReward: 25, content: JSON.stringify(getLessonContent('clothes')) },
      { order: 20, title: 'Lição 20: Revisão Final A1', description: 'Revisão de todo o conteúdo A1', xpReward: 50, content: JSON.stringify(getLessonContent('review_a1')) },
    ]

    for (const lesson of a1Lessons) {
      // Use findFirst + create instead of upsert to avoid unique constraint issues
      const existing = await prisma.lesson.findFirst({
        where: {
          courseId: a1Course.id,
          order: lesson.order,
        },
      })

      if (!existing) {
        await prisma.lesson.create({
          data: {
            ...lesson,
            courseId: a1Course.id,
          },
        })
      }
    }
    console.log('✅ Lições A1 criadas')
  }

  // Create achievements
  const achievements = [
    {
      key: 'first_lesson',
      name: 'Primeiros Passos',
      description: 'Complete sua primeira lição',
      icon: '🎯',
      category: 'LESSONS',
      requirement: JSON.stringify({ type: 'lessons_completed', value: 1 }),
      xpReward: 50,
      rarity: 'COMMON',
    },
    {
      key: 'streak_3',
      name: 'Em Chamas',
      description: 'Mantenha um streak de 3 dias',
      icon: '🔥',
      category: 'STREAK',
      requirement: JSON.stringify({ type: 'streak_days', value: 3 }),
      xpReward: 100,
      rarity: 'COMMON',
    },
    {
      key: 'streak_7',
      name: 'Semana Perfeita',
      description: 'Mantenha um streak de 7 dias',
      icon: '⭐',
      category: 'STREAK',
      requirement: JSON.stringify({ type: 'streak_days', value: 7 }),
      xpReward: 250,
      rarity: 'RARE',
    },
    {
      key: 'streak_30',
      name: 'Dedicado',
      description: 'Mantenha um streak de 30 dias',
      icon: '🌟',
      category: 'STREAK',
      requirement: JSON.stringify({ type: 'streak_days', value: 30 }),
      xpReward: 1000,
      rarity: 'EPIC',
    },
    {
      key: 'xp_1000',
      name: 'Acumulador',
      description: 'Alcance 1.000 XP total',
      icon: '💎',
      category: 'XP',
      requirement: JSON.stringify({ type: 'total_xp', value: 1000 }),
      xpReward: 200,
      rarity: 'RARE',
    },
    {
      key: 'perfect_5',
      name: 'Perfeccionista',
      description: 'Complete 5 lições com 100% de precisão',
      icon: '💯',
      category: 'PERFECT',
      requirement: JSON.stringify({ type: 'perfect_lessons', value: 5 }),
      xpReward: 500,
      rarity: 'EPIC',
    },
    {
      key: 'course_a1',
      name: 'Iniciante Graduado',
      description: 'Complete o curso A1',
      icon: '🎓',
      category: 'LESSONS',
      requirement: JSON.stringify({ type: 'lessons_completed', value: 20 }),
      xpReward: 500,
      rarity: 'RARE',
    },
    {
      key: 'legendary',
      name: 'Lenda Viva',
      description: 'Alcance nível C2',
      icon: '👑',
      category: 'SPECIAL',
      requirement: JSON.stringify({ type: 'level_up', value: 6 }),
      xpReward: 5000,
      rarity: 'LEGENDARY',
    },
  ]

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: ach,
      create: ach,
    })
  }

  console.log('✅ Conquistas criadas')
  console.log('🎉 Seed concluído com sucesso!')
}

function getLessonContent(type: string) {
  const baseContent = {
    vocabulary: [],
    grammar: [],
    exercises: [],
    dialogue: null,
    culturalNote: null,
  }

  switch (type) {
    case 'alphabet':
      return {
        ...baseContent,
        vocabulary: [
          { id: 'v1', word: 'Hello', translation: 'Olá', pronunciation: '/həˈloʊ/', partOfSpeech: 'interjection', exampleSentence: 'Hello, how are you?', exampleTranslation: 'Olá, como você está?' },
          { id: 'v2', word: 'Goodbye', translation: 'Tchau', pronunciation: '/ɡʊdˈbaɪ/', partOfSpeech: 'interjection', exampleSentence: 'Goodbye, see you later!', exampleTranslation: 'Tchau, até logo!' },
          { id: 'v3', word: 'Please', translation: 'Por favor', pronunciation: '/pliːz/', partOfSpeech: 'adverb', exampleSentence: 'Please sit down.', exampleTranslation: 'Por favor, sente-se.' },
          { id: 'v4', word: 'Thank you', translation: 'Obrigado', pronunciation: '/θæŋk juː/', partOfSpeech: 'phrase', exampleSentence: 'Thank you for your help.', exampleTranslation: 'Obrigado pela sua ajuda.' },
        ],
        grammar: [{
          id: 'g1',
          title: 'O Alfabeto Inglês',
          explanation: 'O inglês usa o mesmo alfabeto latino do português, mas com 26 letras. A pronúncia é diferente!',
          examples: [
            { sentence: 'A - /eɪ/', translation: 'Som "ei"', highlight: 'A' },
            { sentence: 'B - /biː/', translation: 'Som "bi"', highlight: 'B' },
            { sentence: 'C - /siː/', translation: 'Som "si"', highlight: 'C' },
          ],
          rules: ['Vogais: A, E, I, O, U', 'Consoantes: todas as outras', 'Y às vezes é vogal'],
        }],
        exercises: [
          { id: 'ex1', type: 'MULTIPLE_CHOICE', question: 'Como se pronuncia a letra "A" em inglês?', instruction: 'Selecione a opção correta', options: [{ id: '1', text: '/eɪ/ (som "ei")', isCorrect: true }, { id: '2', text: '/aː/ (som "a")', isCorrect: false }, { id: '3', text: '/æ/ (som "ae")', isCorrect: false }, { id: '4', text: '/ʌ/ (som "u")', isCorrect: false }], correctAnswer: '1', explanation: 'A letra A em inglês tem o som /eɪ/, como em "day" ou "say".', xpReward: 5, difficulty: 1 },
          { id: 'ex2', type: 'MULTIPLE_CHOICE', question: 'Qual das seguintes saudações significa "Olá"?', instruction: 'Escolha a tradução correta', options: [{ id: '1', text: 'Goodbye', isCorrect: false }, { id: '2', text: 'Hello', isCorrect: true }, { id: '3', text: 'Please', isCorrect: false }, { id: '4', text: 'Thank you', isCorrect: false }], correctAnswer: '2', explanation: 'Hello é a saudação padrão para "Olá" em inglês.', xpReward: 5, difficulty: 1 },
          { id: 'ex3', type: 'FILL_BLANK', question: 'Complete: "_____ you for your help."', instruction: 'Digite a palavra que falta', correctAnswer: ['Thank', 'thank'], explanation: 'Thank you = Obrigado. É a forma educada de agradecer.', xpReward: 5, difficulty: 2 },
          { id: 'ex4', type: 'TRANSLATION', question: 'Traduza para o inglês: "Por favor, sente-se."', instruction: 'Digite a tradução', correctAnswer: ['Please sit down', 'Please sit down.'], explanation: 'Please = Por favor. Sit down = Sente-se.', xpReward: 10, difficulty: 2 },
        ],
      }
    case 'greetings':
      return {
        ...baseContent,
        vocabulary: [
          { id: 'v1', word: 'Good morning', translation: 'Bom dia', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/', partOfSpeech: 'phrase', exampleSentence: 'Good morning, everyone!', exampleTranslation: 'Bom dia, todos!' },
          { id: 'v2', word: 'Good afternoon', translation: 'Boa tarde', pronunciation: '/ɡʊd ˌæftərˈnuːn/', partOfSpeech: 'phrase', exampleSentence: 'Good afternoon, sir.', exampleTranslation: 'Boa tarde, senhor.' },
          { id: 'v3', word: 'Good evening', translation: 'Boa noite', pronunciation: '/ɡʊd ˈiːvnɪŋ/', partOfSpeech: 'phrase', exampleSentence: 'Good evening, friends.', exampleTranslation: 'Boa noite, amigos.' },
          { id: 'v4', word: 'Good night', translation: 'Boa noite (para dormir)', pronunciation: '/ɡʊd naɪt/', partOfSpeech: 'phrase', exampleSentence: 'Good night, sleep well.', exampleTranslation: 'Boa noite, durma bem.' },
          { id: 'v5', word: 'How are you?', translation: 'Como você está?', pronunciation: '/haʊ ɑːr juː/', partOfSpeech: 'phrase', exampleSentence: 'Hi! How are you?', exampleTranslation: 'Oi! Como você está?' },
          { id: 'v6', word: 'Nice to meet you', translation: 'Prazer em conhecê-lo', pronunciation: '/naɪs tuː miːt juː/', partOfSpeech: 'phrase', exampleSentence: 'Nice to meet you, John.', exampleTranslation: 'Prazer em conhecê-lo, John.' },
        ],
        grammar: [{
          id: 'g1',
          title: 'Saudações Formais vs Informais',
          explanation: 'Em inglês, existem saudações para diferentes horários e níveis de formalidade.',
          examples: [
            { sentence: 'Good morning / afternoon / evening', translation: 'Formais - uso profissional', highlight: 'Good' },
            { sentence: 'Hi / Hey', translation: 'Informais - amigos e família', highlight: 'Hi' },
            { sentence: 'What\'s up?', translation: 'Muito informal - amigos próximos', highlight: 'What\'s up' },
          ],
          rules: ['Use "Good morning" até 12h', 'Use "Good afternoon" de 12h às 18h', 'Use "Good evening" após 18h', '"Good night" é apenas para despedida antes de dormir'],
        }],
        exercises: [
          { id: 'ex1', type: 'MULTIPLE_CHOICE', question: 'Qual saudação usar às 14h?', instruction: 'Selecione a opção correta', options: [{ id: '1', text: 'Good morning', isCorrect: false }, { id: '2', text: 'Good afternoon', isCorrect: true }, { id: '3', text: 'Good evening', isCorrect: false }, { id: '4', text: 'Good night', isCorrect: false }], correctAnswer: '2', explanation: 'Good afternoon é usado do meio-dia até o final da tarde (aprox. 18h).', xpReward: 5, difficulty: 1 },
          { id: 'ex2', type: 'MULTIPLE_CHOICE', question: '"Nice to meet you" significa:', instruction: 'Escolha a tradução correta', options: [{ id: '1', text: 'Boa noite', isCorrect: false }, { id: '2', text: 'Prazer em conhecê-lo', isCorrect: true }, { id: '3', text: 'Como vai você?', isCorrect: false }, { id: '4', text: 'Até logo', isCorrect: false }], correctAnswer: '2', explanation: 'Nice to meet you = Prazer em conhecê-lo. Usado na primeira vez que encontra alguém.', xpReward: 5, difficulty: 1 },
          { id: 'ex3', type: 'TRANSLATION', question: 'Traduza: "Boa noite, durma bem."', instruction: 'Digite a tradução', correctAnswer: ['Good night, sleep well', 'Good night sleep well'], explanation: 'Good night = Boa noite (despedida). Sleep well = Durma bem.', xpReward: 10, difficulty: 2 },
        ],
      }
    default:
      return {
        ...baseContent,
        vocabulary: [
          { id: 'v1', word: 'Example', translation: 'Exemplo', pronunciation: '/ɪɡˈzæmpl/', partOfSpeech: 'noun', exampleSentence: 'This is an example.', exampleTranslation: 'Este é um exemplo.' },
        ],
        grammar: [{
          id: 'g1',
          title: 'Gramática Básica',
          explanation: 'Conteúdo em desenvolvimento.',
          examples: [],
          rules: ['Regra 1', 'Regra 2'],
        }],
        exercises: [
          { id: 'ex1', type: 'MULTIPLE_CHOICE', question: 'Pergunta de exemplo?', instruction: 'Selecione', options: [{ id: '1', text: 'Opção 1', isCorrect: true }, { id: '2', text: 'Opção 2', isCorrect: false }], correctAnswer: '1', explanation: 'Explicação.', xpReward: 5, difficulty: 1 },
        ],
      }
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })