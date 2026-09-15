import {
  collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, writeBatch, increment, getCountFromServer,
  collectionGroup,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { deleteUser, signInAnonymously } from 'firebase/auth';
import { db, storage, auth } from '../config/firebase';

// ─── HELPERS ────────────────────────────────────────────────────────────────

export const mapPost = (id: string, data: any): any => ({
  id,
  title_en:      data.title_en || data.caption || '',
  title_te:      data.title_te || data.caption || '',
  content_en:    data.content_en || '',
  content_te:    data.content_te || '',
  author_name:   data.userName || 'Anonymous',
  author_photo:  data.userPhotoURL || null,
  author_id:     data.userId || '',
  media_url:     data.mediaUrl || null,
  type:          data.type || data.mediaType || 'text',
  like_count:    data.likeCount || 0,
  comment_count: data.commentCount || 0,
  liked_by_me:   false,
  name_en:       data.categoryName_en || 'General',
  name_te:       data.categoryName_te || 'సాధారణం',
  is_promotion:  data.isPromotion || false,
  is_quick_clip: data.isQuickClip || false,
  status:        data.status || 'approved',
  privacy:       data.privacy || 'public',
  created_at:    data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
});

// ─── USER ────────────────────────────────────────────────────────────────────

export const createOrUpdateUser = async (firebaseUser: any, extraName?: string) => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name:          firebaseUser.displayName || '',
      email:         firebaseUser.email || '',
      photoURL:      firebaseUser.photoURL || '',
      role:          'user',
      followerCount: 0,
      followingCount:0,
      location:      extraName || '',
      bio:           '',
      createdAt:     serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      name:     snap.data().name || firebaseUser.displayName,
      photoURL: snap.data().photoURL || firebaseUser.photoURL,
    });
  }

  const updated = await getDoc(userRef);
  return { id: updated.id, ...updated.data() };
};

export const getUser = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateUserProfile = async (uid: string, data: any) => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const deleteUserAccount = async (uid: string) => {
  const postsQ = query(collection(db, 'posts'), where('userId', '==', uid));
  const postSnap = await getDocs(postsQ);
  const batch = writeBatch(db);
  postSnap.forEach(p => batch.delete(p.ref));
  batch.delete(doc(db, 'users', uid));
  await batch.commit();
  if (auth.currentUser) await deleteUser(auth.currentUser);
};

export const uploadProfilePhoto = async (uid: string, uri: string): Promise<string> => {
  const storageRef = ref(storage, `avatars/${uid}/profile.jpg`);
  const response = await fetch(uri);
  const blob = await response.blob();
  const task = await uploadBytesResumable(storageRef, blob);
  const url = await getDownloadURL(task.ref);
  await updateDoc(doc(db, 'users', uid), { photoURL: url });
  return url;
};

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { name_en: 'Politics',  name_te: 'రాజకీయాలు' },
  { name_en: 'Crime',     name_te: 'నేరాలు' },
  { name_en: 'Jobs',      name_te: 'ఉద్యోగాలు' },
  { name_en: 'Education', name_te: 'విద్య' },
  { name_en: 'Weather',   name_te: 'వాతావరణం' },
  { name_en: 'Local',     name_te: 'స్థానికం' },
];

export const getCategories = async () => {
  const snap = await getDocs(collection(db, 'categories'));
  if (snap.empty) {
    const batch = writeBatch(db);
    DEFAULT_CATEGORIES.forEach(cat => {
      batch.set(doc(collection(db, 'categories')), cat);
    });
    await batch.commit();
    return DEFAULT_CATEGORIES;
  }
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── POSTS ───────────────────────────────────────────────────────────────────

export const fetchFeedPosts = async (currentUid?: string): Promise<any[]> => {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'approved'),
    where('isPromotion', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map(d => mapPost(d.id, d.data()));

  const filteredPosts = [];
  for (const post of posts) {
    if (post.is_quick_clip) continue;

    if (!post.privacy || post.privacy === 'public') {
      filteredPosts.push(post);
    } else if (currentUid) {
      if (post.author_id === currentUid) {
        filteredPosts.push(post);
      } else if (post.privacy === 'followers') {
        const following = await checkIsFollowing(currentUid, post.author_id);
        if (following) filteredPosts.push(post);
      }
    }
  }
  return filteredPosts;
};

export const fetchPromotions = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'posts'),
    where('isPromotion', '==', true),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => mapPost(d.id, d.data()));
};

export const fetchQuickClips = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'posts'),
    where('isQuickClip', '==', true),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => mapPost(d.id, d.data()));
};

export const fetchUserPosts = async (uid: string): Promise<any[]> => {
  const q = query(
    collection(db, 'posts'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => mapPost(d.id, d.data()));
};

export const fetchPendingPromotions = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'posts'),
    where('isPromotion', '==', true),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => mapPost(d.id, d.data()));
};

export const createPost = async (
  data: any,
  mediaFile?: { uri: string; type: 'image' | 'video' },
): Promise<any> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const userData = userSnap.data();

  let mediaUrl: string | null = null;
  if (mediaFile) {
    const filename = mediaFile.uri.split('/').pop() || `upload_${Date.now()}`;
    const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${filename}`);
    const response = await fetch(mediaFile.uri);
    const blob = await response.blob();
    const uploadTask = await uploadBytesResumable(storageRef, blob);
    mediaUrl = await getDownloadURL(uploadTask.ref);
  }

  const postData = {
    userId:       user.uid,
    userName:     userData?.name || user.displayName || 'Anonymous',
    userPhotoURL: userData?.photoURL || user.photoURL || '',
    title_en:     data.title_en || data.caption || '',
    title_te:     data.title_te || data.caption || '',
    content_en:   data.content_en || '',
    content_te:   data.content_te || '',
    caption:      data.caption || data.title_en || '',
    mediaUrl,
    type:         mediaFile?.type || 'text',
    categoryId:   data.categoryId || null,
    location:     data.location || '',
    isPromotion:  data.isPromotion || false,
    isQuickClip:  data.isQuickClip || false,
    status:       (data.isPromotion && userData?.role !== 'admin') ? 'pending' : 'approved',
    privacy:      data.privacy || 'public',
    likeCount:    0,
    commentCount: 0,
    reportCount:  0,
    createdAt:    serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'posts'), postData);
  return { id: docRef.id, ...postData };
};

export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, 'posts', postId));
};

export const updatePostStatus = async (postId: string, status: 'approved' | 'rejected') => {
  await updateDoc(doc(db, 'posts', postId), { status });
};

// ─── LIKES ───────────────────────────────────────────────────────────────────

export const toggleLike = async (postId: string, uid: string) => {
  const likeRef  = doc(db, 'posts', postId, 'likes', uid);
  const postRef  = doc(db, 'posts', postId);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likeCount: increment(-1) });
    const postSnap = await getDoc(postRef);
    return { liked: false, like_count: (postSnap.data()?.likeCount || 0) };
  } else {
    await setDoc(likeRef, { userId: uid, createdAt: serverTimestamp() });
    await updateDoc(postRef, { likeCount: increment(1) });

    // Notify post author
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    if (postData && postData.userId !== uid) {
      await addNotification(postData.userId, {
        type: 'like', actorId: uid,
        postId, postTitle: postData.title_en || postData.caption || '',
      });
    }
    return { liked: true, like_count: (postSnap.data()?.likeCount || 0) };
  }
};

// ─── COMMENTS ────────────────────────────────────────────────────────────────

export const getComments = async (postId: string) => {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    created_at: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
};

export const addComment = async (postId: string, uid: string, content: string) => {
  const user = auth.currentUser;
  const userSnap = await getDoc(doc(db, 'users', uid));
  const userData = userSnap.data();

  const commentRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
    userId:       uid,
    userName:     userData?.name || user?.displayName || 'Anonymous',
    userPhotoURL: userData?.photoURL || user?.photoURL || '',
    content:      content.trim(),
    createdAt:    serverTimestamp(),
  });

  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });

  const postSnap = await getDoc(doc(db, 'posts', postId));
  const postData = postSnap.data();
  if (postData && postData.userId !== uid) {
    await addNotification(postData.userId, {
      type: 'comment', actorId: uid,
      postId, postTitle: postData.title_en || postData.caption || '',
    });
  }
  return { id: commentRef.id };
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export const reportPost = async (postId: string, uid: string, reason?: string) => {
  await setDoc(doc(db, 'posts', postId, 'reports', uid), {
    userId: uid, reason: reason || '', createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'posts', postId), { reportCount: increment(1) });
};

export const fetchReportedPosts = async () => {
  const q = query(collection(db, 'posts'), where('reportCount', '>', 0));
  const snap = await getDocs(q);
  return snap.docs.map(d => mapPost(d.id, d.data()));
};

export const dismissPostReports = async (postId: string) => {
  await updateDoc(doc(db, 'posts', postId), { reportCount: 0 });
};

// ─── FOLLOWERS / FOLLOWING ──────────────────────────────────────────────────

export const toggleFollowUser = async (currentUid: string, targetUid: string) => {
  const followRef = doc(db, 'users', targetUid, 'followers', currentUid);
  const followingRef = doc(db, 'users', currentUid, 'following', targetUid);

  const snap = await getDoc(followRef);
  if (snap.exists()) {
    await deleteDoc(followRef);
    await deleteDoc(followingRef);
    await updateDoc(doc(db, 'users', targetUid), { followerCount: increment(-1) });
    await updateDoc(doc(db, 'users', currentUid), { followingCount: increment(-1) });
    return false;
  } else {
    await setDoc(followRef, { createdAt: serverTimestamp() });
    await setDoc(followingRef, { createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', targetUid), { followerCount: increment(1) });
    await updateDoc(doc(db, 'users', currentUid), { followingCount: increment(1) });
    return true;
  }
};

export const checkIsFollowing = async (currentUid: string, targetUid: string) => {
  const snap = await getDoc(doc(db, 'users', targetUid, 'followers', currentUid));
  return snap.exists();
};

// ─── SAVED POSTS ────────────────────────────────────────────────────────────

export const toggleSavePost = async (uid: string, postId: string) => {
  const savedRef = doc(db, 'users', uid, 'savedPosts', postId);
  const snap = await getDoc(savedRef);
  if (snap.exists()) {
    await deleteDoc(savedRef);
    return false;
  } else {
    await setDoc(savedRef, { createdAt: serverTimestamp() });
    return true;
  }
};

export const checkIsSaved = async (uid: string, postId: string) => {
  const snap = await getDoc(doc(db, 'users', uid, 'savedPosts', postId));
  return snap.exists();
};

export const fetchSavedPosts = async (uid: string) => {
  const q = query(collection(db, 'users', uid, 'savedPosts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const postPromises = snap.docs.map(async (d) => {
    const postSnap = await getDoc(doc(db, 'posts', d.id));
    if (postSnap.exists()) return mapPost(postSnap.id, postSnap.data());
    return null;
  });
  const posts = await Promise.all(postPromises);
  return posts.filter(Boolean);
};

export const fetchSavedPostIds = async (uid: string): Promise<string[]> => {
  const snap = await getDocs(collection(db, 'users', uid, 'savedPosts'));
  return snap.docs.map(d => d.id);
};


// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export const addNotification = async (targetUid: string, data: any) => {
  const actorSnap = await getDoc(doc(db, 'users', data.actorId));
  const actorData = actorSnap.data();
  await addDoc(collection(db, 'users', targetUid, 'notifications'), {
    type:       data.type,
    actorId:    data.actorId,
    actorName:  actorData?.name || 'Someone',
    actorPhoto: actorData?.photoURL || '',
    postId:     data.postId || null,
    postTitle:  data.postTitle || '',
    isRead:     false,
    createdAt:  serverTimestamp(),
  });
};

export const getNotifications = async (uid: string) => {
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id, ...d.data(),
    created_at: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
};

export const markNotificationsRead = async (uid: string) => {
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    where('isRead', '==', false),
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach(d => batch.update(d.ref, { isRead: true }));
  await batch.commit();
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const [usersCount, postsCount, pendingSnap] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(query(collection(db, 'posts'), where('status', '==', 'approved'))),
    getCountFromServer(query(
      collection(db, 'posts'),
      where('isPromotion', '==', true),
      where('status', '==', 'pending'),
    )),
  ]);
  const reportsSnap = await getCountFromServer(collectionGroup(db, 'reports'));
  return {
    total_users:         usersCount.data().count,
    total_posts:         postsCount.data().count,
    pending_promotions:  pendingSnap.data().count,
    total_reports:       reportsSnap.data().count,
  };
};

export const fetchAllUsers = async () => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const banUser = async (uid: string, banned: boolean) => {
  await updateDoc(doc(db, 'users', uid), {
    isBanned: banned,
  });
};

export const changeUserRole = async (uid: string, role: 'user' | 'admin' | 'super_admin') => {
  await updateDoc(doc(db, 'users', uid), { role });
};

// ─── ANONYMOUS (Skip Login) ──────────────────────────────────────────────────

export const signInAnon = async () => {
  const result = await signInAnonymously(auth);
  return result.user;
};

// ─── PROMOTION BANNERS (Admin Controlled) ────────────────────────────────────

export const fetchPromotionBanners = async () => {
  const q = query(collection(db, 'promotionBanners'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createPromotionBanner = async (data: {
  imageUrl: string;
  redirectUrl?: string;
  title?: string;
  active: boolean;
}) => {
  return addDoc(collection(db, 'promotionBanners'), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updatePromotionBanner = async (id: string, data: Partial<{
  imageUrl: string;
  redirectUrl: string;
  title: string;
  active: boolean;
}>) => {
  await updateDoc(doc(db, 'promotionBanners', id), data);
};

export const deletePromotionBanner = async (id: string) => {
  await deleteDoc(doc(db, 'promotionBanners', id));
};

export const uploadBannerImage = async (uid: string, uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `banners/${uid}_${Date.now()}.jpg`);
  await new Promise<void>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on('state_changed', null, reject, () => resolve());
  });
  return getDownloadURL(storageRef);
};
