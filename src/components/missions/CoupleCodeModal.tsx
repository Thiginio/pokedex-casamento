import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Mission } from '../../types/mission';
import { validateCoupleMissionCode } from '../../services/coupleCodeService';

interface CoupleCodeModalProps {
  mission: Mission;
  onClose: () => void;
  onSuccess: (code: string) => void;
}

export const CoupleCodeModal: React.FC<CoupleCodeModalProps> = ({
  mission,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const coupleIcon =
    mission.codeConfig?.coupleType === 'MIRELLA'
      ? '👰'
      : mission.codeConfig?.coupleType === 'JOAO'
      ? '🤵'
      : '💍';

  const handleValidate = () => {
    setErrorMessage(null);
    setIsValidating(true);

    const result = validateCoupleMissionCode(mission.id, code);
    setIsValidating(false);

    if (result.valid) {
      onSuccess(code.trim().toUpperCase());
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <View style={styles.overlay}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{coupleIcon}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {mission.nome}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>{mission.descricao}</Text>

        {mission.codeConfig?.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Dica dos Noivos:</Text>
            <Text style={styles.hintText}>{mission.codeConfig.hint}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>CÓDIGO SECRETO:</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(txt) => {
              setCode(txt);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Ex: POKEMON-AMOR-ETERNO"
            placeholderTextColor="#475569"
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.submitBtn, isValidating && styles.btnDisabled]}
            onPress={handleValidate}
            disabled={isValidating}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {isValidating ? 'VALIDANDO...' : '🔑 VALIDAR CÓDIGO'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 3,
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 12,
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
  description: {
    color: '#CBD5E1',
    fontSize: 7.2,
    lineHeight: 9.5,
    marginBottom: 4,
  },
  hintBox: {
    backgroundColor: '#1E293B',
    borderRadius: 4,
    padding: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#EC4899',
    marginBottom: 5,
  },
  hintTitle: {
    color: '#F472B6',
    fontSize: 6.8,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  hintText: {
    color: '#E2E8F0',
    fontSize: 6.5,
    lineHeight: 8.5,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 6.5,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: '#450A0A',
    borderColor: '#DC2626',
    borderWidth: 1,
    borderRadius: 4,
    padding: 3,
    marginBottom: 4,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 6.5,
    lineHeight: 8.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#CBD5E1',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
});
