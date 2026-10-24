import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Mission } from '../../types/mission';
import {
  WHO_IS_THAT_POKEMON_CHALLENGES,
  COUPLE_QUIZ_CHALLENGES,
  WEDDING_CHALLENGES,
  QuizQuestion,
  validateMinigameResult,
} from '../../services/gameService';

interface MinigameModalProps {
  mission: Mission;
  onClose: () => void;
  onSuccess: (score: number) => void;
}

export const MinigameModal: React.FC<MinigameModalProps> = ({
  mission,
  onClose,
  onSuccess,
}) => {
  const isCoupleQuiz = mission.gameConfig?.gameType === 'QUIZ_CASAL';
  const questions: QuizQuestion[] =
    WEDDING_CHALLENGES[mission.id] ||
    (isCoupleQuiz ? COUPLE_QUIZ_CHALLENGES : WHO_IS_THAT_POKEMON_CHALLENGES);

  const targetScore = mission.gameConfig?.targetScore || 2;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setIsFinished(true);
      }
    }, 900);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
  };

  const result = validateMinigameResult(score, targetScore);

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <Text style={styles.icon}>{isCoupleQuiz ? '💍' : '🎮'}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {mission.nome}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {!isFinished ? (
        <ScrollView
          style={styles.gameBody}
          contentContainerStyle={styles.gameContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              Pergunta {currentIndex + 1} de {questions.length}
            </Text>
            <Text style={styles.scoreText}>Pontos: {score}</Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQ.question}</Text>
          </View>

          <View style={styles.optionsList}>
            {currentQ.options.map((opt, idx) => {
              let optStyle = styles.optionBtn;
              let textStyle = styles.optionText;

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optStyle = [styles.optionBtn, styles.optionCorrect] as any;
                  textStyle = [styles.optionText, styles.textCorrect] as any;
                } else if (idx === selectedOption) {
                  optStyle = [styles.optionBtn, styles.optionWrong] as any;
                  textStyle = [styles.optionText, styles.textWrong] as any;
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={optStyle}
                  onPress={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  activeOpacity={0.7}
                >
                  <Text style={textStyle}>
                    {String.fromCharCode(65 + idx)}) {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            {result.passed ? '🎉 VITÓRIA!' : '⚠️ Tente Novamente'}
          </Text>
          <Text style={styles.resultScore}>
            Pontuação: {score} de {questions.length} (Meta: {targetScore})
          </Text>
          <Text style={styles.resultMessage}>{result.message}</Text>

          <View style={styles.resultActions}>
            {result.passed ? (
              <TouchableOpacity
                style={styles.claimBtn}
                onPress={() => onSuccess(score)}
                activeOpacity={0.8}
              >
                <Text style={styles.claimBtnText}>🏆 RESGATAR RECOMPENSA</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={handleRestart}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>🔄 TENTAR NOVAMENTE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    zIndex: 100,
    padding: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 3,
    marginBottom: 4,
  },
  icon: {
    fontSize: 11,
    marginRight: 4,
  },
  title: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  closeBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#334155',
    borderRadius: 3,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  gameBody: {
    flex: 1,
  },
  gameContent: {
    paddingBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 6.5,
    fontWeight: '600',
  },
  scoreText: {
    color: '#FACC15',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 4,
    padding: 5,
    marginBottom: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#FACC15',
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 7.2,
    fontWeight: 'bold',
    lineHeight: 9.5,
  },
  optionsList: {
    gap: 3,
  },
  optionBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionText: {
    color: '#E2E8F0',
    fontSize: 6.8,
    fontWeight: '600',
  },
  optionCorrect: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  textCorrect: {
    color: '#A7F3D0',
    fontWeight: 'bold',
  },
  optionWrong: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  textWrong: {
    color: '#FECACA',
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 2,
  },
  resultScore: {
    color: '#FACC15',
    fontSize: 7.5,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  resultMessage: {
    color: '#CBD5E1',
    fontSize: 6.8,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 8.5,
  },
  resultActions: {
    width: '100%',
    gap: 3,
  },
  claimBtn: {
    backgroundColor: '#EAB308',
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#0F172A',
    fontSize: 7.5,
    fontWeight: '900',
  },
  retryBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingVertical: 3,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#CBD5E1',
    fontSize: 7,
    fontWeight: '600',
  },
});
