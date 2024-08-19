import prisma from '../database/db.config';
import sendSms from '../utils/sendSms';

const sendReportWarningSms = async (userId: number, postId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true }
    });

    if (!user || !user.phoneNumber) {
      console.error('User not found or phone number not available');
      return;
    }

    const message = `Votre post avec l'ID ${postId} a reçu deux signalements. S'il en reçoit un quatrième , il sera supprimé.`;
    await sendSms(user.phoneNumber, message);
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Error sending report warning SMS:', error);
  }
};
export default sendReportWarningSms ;
